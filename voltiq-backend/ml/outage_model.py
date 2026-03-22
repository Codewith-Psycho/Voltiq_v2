# ml/outage_model.py - VoltIQ-OPC (Outage Probability Classifier)
"""
XGBoost classifier for power outage prediction.
Trained on IEX India DAM data (2018-2024, 233,665 rows).

Input: Time features + market clearing price
Output: 24-hour outage probability with risk flags
"""

import joblib
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from config import settings


class OPCModel:
    # Risk threshold for blocking hours in MILP
    HIGH_RISK_THRESHOLD = 0.60
    
    def __init__(self, model_dir: str = None):
        d = Path(model_dir or settings.MODELS_PATH)
        
        self.model = joblib.load(d / 'outage_clf.pkl')
        self.feat_cols = joblib.load(d / 'outage_feature_cols.pkl')
        
        print('✅ VoltIQ-OPC loaded (outage classifier)')

    def predict_24hr(
        self,
        month: Optional[int] = None,
        dow: Optional[int] = None,
        mcp: float = 4000.0
    ) -> List[Dict]:
        """
        Predict outage probability for next 24 hours.
        
        Args:
            month: Month (1-12), defaults to current
            dow: Day of week (0=Mon, 6=Sun), defaults to current
            mcp: Market Clearing Price in Rs/MWh (default 4000)
        
        Returns:
            List of {hour, probability, is_high_risk} for 24 hours
        """
        now = datetime.now()
        month = month or now.month
        dow = dow or now.weekday()
        season = self._get_season(month)
        
        rows = []
        for h in range(24):
            # Simulate price variation (peak hours higher)
            is_peak = 18 <= h < 22
            price = mcp * (1.5 if is_peak else 1.0)
            
            # Build feature row matching training columns
            row = [
                h,                                          # hour
                month,                                      # month
                dow,                                        # day_of_week
                int(dow >= 5),                              # is_weekend
                season,                                     # season
                0,                                          # is_holiday (assume no)
                np.sin(2 * np.pi * h / 24),                # hour_sin
                np.cos(2 * np.pi * h / 24),                # hour_cos
                np.sin(2 * np.pi * month / 12),            # month_sin
                np.cos(2 * np.pi * month / 12),            # month_cos
                price,                                      # mcp
                price * 0.95,                               # purchase_bid
                500 if is_peak else -100,                   # price_change
                200 if is_peak else 20,                     # volume_mw
                1.5 if is_peak else 0.9,                    # demand_ratio
                0.88 if is_peak else 0.97,                  # clearing_ratio
                mcp * 1.2,                                  # max_price
                0.80 if is_peak else 0.40,                  # congestion_indicator
            ]
            rows.append(row)
        
        X = np.array(rows, dtype='float32')
        probs = self.model.predict_proba(X)[:, 1]
        
        return [
            {
                'hour': h,
                'probability': round(float(probs[h]), 3),
                'is_high_risk': bool(probs[h] >= self.HIGH_RISK_THRESHOLD)
            }
            for h in range(24)
        ]

    def get_blocked_hours(self, predictions: List[Dict] = None) -> List[int]:
        """
        Get list of hours to block in MILP (high risk).
        """
        if predictions is None:
            predictions = self.predict_24hr()
        
        return [p['hour'] for p in predictions if p['is_high_risk']]

    def _get_season(self, month: int) -> int:
        """
        Get season code for India:
        0: Winter (Dec-Feb)
        1: Summer (Apr-Jun)
        2: Monsoon (Jul-Sep)
        3: Post-Monsoon (Oct-Nov, Mar)
        """
        if month in [12, 1, 2]:
            return 0  # Winter
        elif month in [4, 5, 6]:
            return 1  # Summer
        elif month in [7, 8, 9]:
            return 2  # Monsoon
        else:
            return 3  # Post-Monsoon

    def get_risk_summary(self, predictions: List[Dict] = None) -> Dict:
        """
        Get summary of outage risk for the day.
        """
        if predictions is None:
            predictions = self.predict_24hr()
        
        high_risk_hours = [p['hour'] for p in predictions if p['is_high_risk']]
        avg_prob = np.mean([p['probability'] for p in predictions])
        max_prob = max([p['probability'] for p in predictions])
        max_hour = predictions[np.argmax([p['probability'] for p in predictions])]['hour']
        
        return {
            'high_risk_hours': high_risk_hours,
            'high_risk_count': len(high_risk_hours),
            'average_probability': round(avg_prob, 3),
            'max_probability': round(max_prob, 3),
            'max_risk_hour': max_hour,
            'risk_level': 'HIGH' if len(high_risk_hours) > 4 else 'MEDIUM' if high_risk_hours else 'LOW'
        }
