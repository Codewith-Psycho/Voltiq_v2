# ml/lfe_model.py - VoltIQ-LFE (Load Forecast Engine)
"""
LightGBM 3-model ensemble for load forecasting:
- baseline.pkl: Baseline load prediction
- p90.pkl: 90th percentile prediction
- peak.pkl: Peak probability classifier

Input: 672 readings (7 days × 96 readings at 15-min intervals)
Output: 24-hour forecasts (baseline, p90, peak probability)
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from config import settings


class LFEModel:
    def __init__(self, model_dir: str = None):
        d = Path(model_dir or settings.MODELS_PATH)
        
        self.baseline = joblib.load(d / 'baseline.pkl')
        self.p90 = joblib.load(d / 'p90.pkl')
        self.peak_clf = joblib.load(d / 'peak.pkl')
        self.feat_cols = joblib.load(d / 'feature_cols.pkl')
        
        print('✅ VoltIQ-LFE loaded (baseline + p90 + peak)')

    def build_features(self, kw_672: list) -> np.ndarray:
        """
        Build feature matrix from 672 power readings.
        Features: time encoding, lags, rolling averages
        """
        kw = np.array(kw_672, dtype='float32')
        now = pd.Timestamp.now()
        idx = pd.date_range(end=now, periods=672, freq='15min')
        df = pd.DataFrame({'kw': kw}, index=idx)
        
        # Time encoding (cyclical)
        df['hour_sin'] = np.sin(2 * np.pi * df.index.hour / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df.index.hour / 24)
        df['dow_sin'] = np.sin(2 * np.pi * df.index.dayofweek / 7)
        df['dow_cos'] = np.cos(2 * np.pi * df.index.dayofweek / 7)
        
        # Lag features
        df['lag_1'] = df['kw'].shift(1)      # 15 min ago
        df['lag_4'] = df['kw'].shift(4)      # 1 hour ago
        df['lag_96'] = df['kw'].shift(96)    # 1 day ago
        df['lag_672'] = df['kw'].shift(672)  # 7 days ago (if available)
        
        # Rolling averages
        df['roll_4'] = df['kw'].rolling(4).mean()    # 1 hour
        df['roll_24'] = df['kw'].rolling(24).mean()  # 6 hours
        
        # Return features matching trained columns
        return df.dropna()[self.feat_cols].values

    def predict(self, kw_672: list) -> dict:
        """
        Predict 24-hour load forecast.
        
        Returns:
            baseline_hourly: Expected load per hour [24]
            p90_hourly: 90th percentile load per hour [24]
            peak_prob_hourly: Peak probability per hour [24]
        """
        X = self.build_features(kw_672)
        
        if len(X) < 96:
            print("⚠️ LFE: Insufficient data, using fallback")
            return self._fallback()
        
        # Predict with all 3 models (last 96 = 24 hours)
        baseline_pred = self.baseline.predict(X)[-96:]
        p90_pred = self.p90.predict(X)[-96:]
        peak_prob = self.peak_clf.predict_proba(X)[-96:, 1]
        
        # Aggregate to hourly (4 readings per hour)
        def to_hourly(arr):
            return [float(np.mean(arr[h*4:(h+1)*4])) for h in range(24)]
        
        return {
            'baseline_hourly': to_hourly(baseline_pred),
            'p90_hourly': to_hourly(p90_pred),
            'peak_prob_hourly': to_hourly(peak_prob),
        }

    def _fallback(self) -> dict:
        """Fallback prediction when insufficient data"""
        return {
            'baseline_hourly': [0.8] * 24,
            'p90_hourly': [1.2] * 24,
            'peak_prob_hourly': [0.3] * 24,
        }

    def get_dynamic_load_cap(self, lfe_result: dict, base_cap: float = 3.5) -> list:
        """
        Calculate dynamic load cap per hour for MILP.
        Cap = base_cap - baseline - p90_buffer - spike_buffer
        """
        caps = []
        for h in range(24):
            baseline = lfe_result['baseline_hourly'][h]
            p90 = lfe_result['p90_hourly'][h]
            peak_prob = lfe_result['peak_prob_hourly'][h]
            
            # P90 buffer
            p90_buffer = max(0, p90 - baseline) * 0.5
            
            # Spike buffer based on peak probability
            spike_buffer = 0.5 if peak_prob > 0.6 else 0.2
            
            cap = base_cap - baseline - p90_buffer - spike_buffer
            caps.append(max(0.5, round(cap, 2)))  # Minimum 0.5 kW
        
        return caps
