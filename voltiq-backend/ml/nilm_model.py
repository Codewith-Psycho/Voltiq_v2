# ml/nilm_model.py - VoltIQ-NILM (Non-Intrusive Load Monitoring)
"""
CNN Hybrid Appliance Detector.
Trained on iAWE IIT Delhi + Synthetic Indian signatures.

Input: Last 8 power readings (2 minutes at 15s intervals)
Output: Detected appliance, confidence, state (ON/OFF)
"""

import joblib
import numpy as np
from pathlib import Path
from typing import Dict, List
from config import settings


class NILMModel:
    # Power ranges for rule-based filtering (kW)
    POWER_RANGES = {
        'ac': (0.8, 2.5),
        'wm': (0.3, 0.8),           # Washing machine
        'fridge': (0.05, 0.20),
        'geyser': (1.5, 3.0),
        'cooler': (0.1, 0.3),
        'tv': (0.05, 0.15),
        'fan': (0.03, 0.08),
        'microwave': (0.8, 1.5),
    }
    
    # Confidence threshold for detection
    MIN_CONFIDENCE = 0.40
    
    def __init__(self, model_dir: str = None):
        d = Path(model_dir or settings.MODELS_PATH)
        
        # Load classes
        self.classes = joblib.load(d / 'nilm_classes.pkl')
        
        # Try to load TensorFlow model
        self.model = None
        self._use_fallback = False
        
        try:
            import tensorflow as tf
            # Try loading with compile=False to avoid optimizer issues
            self.model = tf.keras.models.load_model(
                d / 'nilm_voltiq.keras',
                compile=False
            )
            print(f'✅ VoltIQ-NILM loaded ({len(self.classes)} classes)')
        except Exception as e:
            print(f'⚠️ VoltIQ-NILM: Keras model load failed, using rule-based fallback')
            print(f'   Error: {e}')
            self._use_fallback = True
            print(f'✅ VoltIQ-NILM loaded (rule-based mode, {len(self.classes)} classes)')

    def detect(self, readings_8: List[float]) -> Dict:
        """
        Detect active appliance from power readings.
        
        Args:
            readings_8: Last 8 power readings in kW
        
        Returns:
            detected: Appliance name
            confidence: Detection confidence (0-1)
            state: ON/OFF
            current_kw: Latest power reading
            all_probs: Probabilities for all classes
        """
        kw = np.array(readings_8, dtype='float32')
        current = float(kw[-1])
        
        # Stage 1: Rule-based filtering
        rule_ok = self._apply_rules(current)
        
        if self._use_fallback or self.model is None:
            # Use pure rule-based detection
            return self._rule_based_detect(current, rule_ok)
        
        # Stage 2: CNN prediction
        try:
            X = kw.reshape(1, 8, 1)
            probs = self.model.predict(X, verbose=0)[0]
        except Exception as e:
            # Fallback on prediction error
            return self._rule_based_detect(current, rule_ok)
        
        # Stage 3: Merge rules + CNN
        merged = probs.copy()
        for i, name in enumerate(self.classes):
            if not rule_ok.get(name, True):
                merged[i] = 0.0
        
        # Normalize
        total = merged.sum()
        if total > 0:
            merged = merged / total
        
        # Get detection result
        idx = int(np.argmax(merged))
        name = self.classes[idx]
        conf = float(merged[idx])
        
        # Low confidence fallback
        if conf < self.MIN_CONFIDENCE:
            name = 'other'
            conf = 1.0 - conf
        
        return {
            'detected': name,
            'confidence': round(conf, 3),
            'state': 'ON' if current > 0.1 else 'OFF',
            'current_kw': round(current, 3),
            'all_probs': {
                n: round(float(merged[i]), 3)
                for i, n in enumerate(self.classes)
            },
            'mode': 'cnn'
        }

    def _rule_based_detect(self, current_kw: float, rule_ok: Dict) -> Dict:
        """Pure rule-based detection when CNN unavailable"""
        # Find best matching appliance by power range
        best_match = 'other'
        best_conf = 0.5
        
        for name, (lo, hi) in self.POWER_RANGES.items():
            if lo <= current_kw <= hi:
                # Calculate confidence based on how centered the value is
                mid = (lo + hi) / 2
                range_width = hi - lo
                distance = abs(current_kw - mid) / (range_width / 2)
                conf = max(0.4, 1.0 - distance * 0.5)
                
                if conf > best_conf:
                    best_match = name
                    best_conf = conf
        
        # Build probability distribution
        all_probs = {}
        for i, name in enumerate(self.classes):
            if name == best_match:
                all_probs[name] = round(best_conf, 3)
            elif rule_ok.get(name, False):
                all_probs[name] = round((1 - best_conf) / max(1, len(self.classes) - 1), 3)
            else:
                all_probs[name] = 0.0
        
        return {
            'detected': best_match,
            'confidence': round(best_conf, 3),
            'state': 'ON' if current_kw > 0.1 else 'OFF',
            'current_kw': round(current_kw, 3),
            'all_probs': all_probs,
            'mode': 'rule-based'
        }

    def _apply_rules(self, current_kw: float) -> Dict[str, bool]:
        """
        Apply power range rules to filter impossible detections.
        """
        result = {}
        for name, (lo, hi) in self.POWER_RANGES.items():
            result[name] = lo <= current_kw <= hi
        result['other'] = True  # Always possible
        return result

    def detect_multiple(self, readings_8: List[float]) -> List[Dict]:
        """
        Detect multiple possible appliances (top 3).
        """
        result = self.detect(readings_8)
        
        # Sort by probability
        sorted_probs = sorted(
            result['all_probs'].items(),
            key=lambda x: -x[1]
        )
        
        results = []
        for name, conf in sorted_probs[:3]:
            if conf >= 0.1:
                results.append({
                    'appliance': name,
                    'confidence': conf,
                    'power_range': self.POWER_RANGES.get(name, (0, 10))
                })
        
        return results

    def get_appliance_info(self, appliance: str) -> Dict:
        """
        Get information about an appliance class.
        """
        power_range = self.POWER_RANGES.get(appliance.lower(), (0, 10))
        
        typical_usage = {
            'ac': {'hours_per_day': 6, 'typical_power': 1.5},
            'wm': {'hours_per_day': 1, 'typical_power': 0.5},
            'fridge': {'hours_per_day': 24, 'typical_power': 0.1},
            'geyser': {'hours_per_day': 0.5, 'typical_power': 2.0},
            'cooler': {'hours_per_day': 8, 'typical_power': 0.2},
            'tv': {'hours_per_day': 4, 'typical_power': 0.1},
            'fan': {'hours_per_day': 10, 'typical_power': 0.06},
            'microwave': {'hours_per_day': 0.2, 'typical_power': 1.0},
        }
        
        usage = typical_usage.get(appliance.lower(), {'hours_per_day': 1, 'typical_power': 0.5})
        
        return {
            'name': appliance,
            'power_range_kw': power_range,
            'typical_power_kw': usage['typical_power'],
            'typical_hours': usage['hours_per_day'],
            'daily_kwh': round(usage['typical_power'] * usage['hours_per_day'], 2)
        }
