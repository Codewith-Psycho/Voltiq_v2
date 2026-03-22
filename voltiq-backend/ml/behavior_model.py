# ml/behavior_model.py - VoltIQ-BHV (Behavior Model)
"""
XGBoost classifier for user behavior prediction.
Predicts probability of appliance usage per hour based on history.

Input: Today's 24hr profile + Yesterday's 24hr profile + is_weekend
Output: Usage probability per hour (for MILP soft weights)
"""

import joblib
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from config import settings


class BHVModel:
    def __init__(self, model_dir: str = None):
        d = Path(model_dir or settings.MODELS_PATH)
        
        self.model = joblib.load(d / 'xgb_behavior.pkl')
        self.threshold = joblib.load(d / 'bhv_threshold.pkl')
        
        print('✅ VoltIQ-BHV loaded (behavior model)')

    def predict_probs(
        self,
        today_24: List[float],
        yesterday_24: List[float],
        is_weekend: bool
    ) -> Dict[int, float]:
        """
        Predict usage probability for each hour.
        
        Args:
            today_24: Today's consumption per hour [24]
            yesterday_24: Yesterday's consumption per hour [24]
            is_weekend: True if weekend
        
        Returns:
            Dict mapping hour -> probability (0-1)
        """
        today = np.array(today_24, dtype='float32')
        yesterday = np.array(yesterday_24, dtype='float32')
        
        # Aggregate features
        usage_sum = float(today.sum())
        peak_hour = float(np.argmax(today))
        
        result = {}
        for h in range(24):
            # Build feature vector
            features = (
                list(today) +           # 24 features
                list(yesterday) +       # 24 features
                [
                    usage_sum,                          # total usage
                    peak_hour,                          # peak hour
                    float(is_weekend),                  # weekend flag
                    float(h),                           # current hour
                    float(np.sin(2 * np.pi * h / 24)),  # hour sin
                    float(np.cos(2 * np.pi * h / 24)),  # hour cos
                ]
            )
            
            X = np.array(features, dtype='float32').reshape(1, -1)
            prob = float(self.model.predict_proba(X)[0, 1])
            result[h] = round(prob, 3)
        
        return result

    def get_preferred_hours(
        self,
        probs: Dict[int, float],
        min_prob: float = None
    ) -> List[int]:
        """
        Get hours with high usage probability (user prefers).
        """
        threshold = min_prob or self.threshold
        return [h for h, p in probs.items() if p >= threshold]

    def get_soft_weights(
        self,
        probs: Dict[int, float],
        weight_factor: float = 0.5
    ) -> Dict[int, float]:
        """
        Convert probabilities to MILP soft weights.
        Higher probability = lower cost penalty (user prefers this hour).
        
        Returns:
            Dict mapping hour -> weight (0-1, lower is better)
        """
        weights = {}
        for h in range(24):
            prob = probs.get(h, 0.5)
            # Invert: high prob = low weight (more preferred)
            weights[h] = round((1 - prob) * weight_factor, 3)
        return weights

    def predict_for_appliance(
        self,
        appliance_name: str,
        today_24: List[float],
        yesterday_24: List[float],
        is_weekend: bool
    ) -> Dict:
        """
        Get behavior prediction with appliance-specific adjustments.
        """
        base_probs = self.predict_probs(today_24, yesterday_24, is_weekend)
        
        # Appliance-specific time preferences (domain knowledge)
        appliance_prefs = {
            'geyser': {'boost': [5, 6, 7], 'reduce': list(range(10, 18))},
            'washing_machine': {'boost': [22, 23, 0, 1], 'reduce': list(range(6, 10))},
            'ac': {'boost': list(range(12, 16)) + list(range(20, 24)), 'reduce': []},
        }
        
        prefs = appliance_prefs.get(appliance_name.lower(), {})
        adjusted = {}
        
        for h in range(24):
            prob = base_probs[h]
            if h in prefs.get('boost', []):
                prob = min(1.0, prob * 1.3)
            if h in prefs.get('reduce', []):
                prob = prob * 0.7
            adjusted[h] = round(prob, 3)
        
        return {
            'appliance': appliance_name,
            'probabilities': adjusted,
            'preferred_hours': self.get_preferred_hours(adjusted),
            'soft_weights': self.get_soft_weights(adjusted)
        }
