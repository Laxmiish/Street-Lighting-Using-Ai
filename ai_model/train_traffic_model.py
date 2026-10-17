"""
LuminaAI — Automated Traffic Density & Adaptive Lighting Model Trainer
Authority: Smart Cities Mission & Directorate of Urban Local Bodies
Dataset: UCI Metro Interstate Traffic Volume Dataset
Model: Ridge Regression (Traffic Density Prediction -> Proactive Adaptive Dimming)
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

UCI_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00492/Metro_Interstate_Traffic_Volume.csv.gz"
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(MODEL_DIR, "traffic_model_weights.json")
OUTPUT_HEADER = os.path.join(MODEL_DIR, "edge_model.h")
LOCAL_CSV_FALLBACK = os.path.join(MODEL_DIR, "traffic_volume_sample.csv")

def generate_synthetic_fallback(filepath, n_samples=5000):
    """Generates realistic diurnal traffic patterns if internet connection is offline"""
    print("[AI Trainer] Generating offline fallback telemetry dataset...")
    np.random.seed(42)
    hours = np.random.randint(0, 24, n_samples)
    days = np.random.randint(0, 7, n_samples)
    temps = np.random.normal(288.15, 12, n_samples) # Kelvin (~15C)
    
    # Realistic traffic: Morning peak (7-9), Evening peak (16-19), Late night lull (23-4)
    traffic = []
    for h, d in zip(hours, days):
        base = 500
        if 7 <= h <= 9 or 16 <= h <= 19:
            base += 4000 + np.random.normal(0, 300)
        elif 10 <= h <= 15:
            base += 2500 + np.random.normal(0, 200)
        elif 22 <= h or h <= 4:
            base += 300 + np.random.normal(0, 80)
        else:
            base += 1500 + np.random.normal(0, 150)
            
        # Weekend reduction
        if d >= 5:
            base *= 0.70
        traffic.append(max(50, base))
        
    df = pd.DataFrame({
        'hour': hours,
        'day_of_week': days,
        'temp': temps,
        'traffic_volume': np.array(traffic, dtype=int)
    })
    df.to_csv(filepath, index=False)
    return df

def fetch_data():
    """Fetches UCI dataset online or falls back to synthetic data if network fails"""
    try:
        print(f"[AI Trainer] Attempting online ingestion from UCI repository:\n{UCI_URL}")
        df = pd.read_csv(UCI_URL, compression='gzip')
        print(f"[AI Trainer] Downloaded {len(df)} records from UCI.")
        df['date_time'] = pd.to_datetime(df['date_time'])
        df['hour'] = df['date_time'].dt.hour
        df['day_of_week'] = df['date_time'].dt.dayofweek
        # Clean temp outliers (Kelvin: 0K anomalies in UCI dataset)
        df = df[df['temp'] > 200].copy()
        return df[['hour', 'day_of_week', 'temp', 'traffic_volume']]
    except Exception as e:
        print(f"[AI Trainer] Online download notice ({e}). Using robust fallback sample.")
        if os.path.exists(LOCAL_CSV_FALLBACK):
            return pd.read_csv(LOCAL_CSV_FALLBACK)
        return generate_synthetic_fallback(LOCAL_CSV_FALLBACK)

def train_and_export():
    df = fetch_data()
    
    # Feature Engineering: Cyclical Hour (sine/cosine) + Day of Week + Temp
    df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24.0)
    df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24.0)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    feature_cols = ['hour', 'sin_hour', 'cos_hour', 'day_of_week', 'is_weekend', 'temp']
    X = df[feature_cols]
    y = df['traffic_volume']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Ridge Regression with L2 Regularization
    alpha = 1.0
    model = Ridge(alpha=alpha)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    
    max_traffic = float(y.max())
    min_traffic = float(y.min())
    
    print("=" * 60)
    print("LuminaAI — Traffic-Adaptive Model Training Complete")
    print(f"R² Score:            {r2:.4f}")
    print(f"RMSE:                {rmse:.2f} vehicles/hour")
    print(f"MAE:                 {mae:.2f} vehicles/hour")
    print(f"Max Traffic Volume:  {max_traffic}")
    print("=" * 60)
    
    # Prepare weights export for Express.js backend & Edge Gateways
    weights_dict = {
        "model_type": "Ridge Regression (Traffic-Adaptive Lighting)",
        "alpha": alpha,
        "intercept": float(model.intercept_),
        "coefficients": {
            "hour": float(model.coef_[0]),
            "sin_hour": float(model.coef_[1]),
            "cos_hour": float(model.coef_[2]),
            "day_of_week": float(model.coef_[3]),
            "is_weekend": float(model.coef_[4]),
            "temp": float(model.coef_[5]),
        },
        "normalization": {
            "min_traffic": min_traffic,
            "max_traffic": max_traffic,
        },
        "dimming_policy": {
            "night_floor_brightness": 20,
            "proactive_peak_brightness": 65,
            "motion_boost_brightness": 85,
            "daylight_lux_cutoff": 50.0,
            "description": "Proactively elevates baseline illumination from 20% to 65% prior to traffic rushes. Radar/PIR surges to 85-100% on immediate trigger."
        },
        "metrics": {
            "r2_score": round(float(r2), 4),
            "rmse": round(float(rmse), 2),
            "mae": round(float(mae), 2),
            "samples_trained": len(X_train)
        }
    }
    
    with open(OUTPUT_JSON, "w") as f:
        json.dump(weights_dict, f, indent=2)
    print(f"[AI Trainer] Exported weights JSON to: {OUTPUT_JSON}")
    
    # Generate C Header for ESP32 / Gateway Edge Nodes
    c_header = f"""/**
 * LuminaAI Edge Model Header
 * Auto-generated by train_traffic_model.py
 * Embedded C/C++ inference kernel for ESP32 & Master Gateways
 */

#ifndef LUMINA_AI_EDGE_MODEL_H
#define LUMINA_AI_EDGE_MODEL_H

#include <math.h>

#define AI_INTERCEPT ({weights_dict['intercept']:.6f}f)
#define AI_COEF_HOUR ({weights_dict['coefficients']['hour']:.6f}f)
#define AI_COEF_SIN_HOUR ({weights_dict['coefficients']['sin_hour']:.6f}f)
#define AI_COEF_COS_HOUR ({weights_dict['coefficients']['cos_hour']:.6f}f)
#define AI_COEF_DOW ({weights_dict['coefficients']['day_of_week']:.6f}f)
#define AI_COEF_WEEKEND ({weights_dict['coefficients']['is_weekend']:.6f}f)
#define AI_COEF_TEMP ({weights_dict['coefficients']['temp']:.6f}f)
#define AI_MAX_TRAFFIC ({weights_dict['normalization']['max_traffic']:.1f}f)
#define AI_MIN_FLOOR ({weights_dict['dimming_policy']['night_floor_brightness']})
#define AI_MAX_BOOST ({weights_dict['dimming_policy']['motion_boost_brightness']})

static inline int lumina_compute_brightness(float lux, int motion, int hour, int day_of_week, float temp_c) {{
    if (lux >= 50.0f) return 0; // Daylight shut-off
    if (motion) return AI_MAX_BOOST; // Instant reactive surge

    float temp_k = temp_c + 273.15f;
    float sin_h = sinf(2.0f * 3.14159265f * hour / 24.0f);
    float cos_h = cosf(2.0f * 3.14159265f * hour / 24.0f);
    int is_weekend = (day_of_week >= 5) ? 1 : 0;

    float predicted_traffic = AI_INTERCEPT + 
        (AI_COEF_HOUR * hour) + 
        (AI_COEF_SIN_HOUR * sin_h) + 
        (AI_COEF_COS_HOUR * cos_h) + 
        (AI_COEF_DOW * day_of_week) + 
        (AI_COEF_WEEKEND * is_weekend) + 
        (AI_COEF_TEMP * temp_k);

    if (predicted_traffic < 0) predicted_traffic = 0;
    float traffic_ratio = predicted_traffic / AI_MAX_TRAFFIC;
    if (traffic_ratio > 1.0f) traffic_ratio = 1.0f;

    // Proactive dimming modulation (20% to 65% base)
    int base_brightness = AI_MIN_FLOOR + (int)(traffic_ratio * (65 - AI_MIN_FLOOR));
    return base_brightness;
}}

#endif // LUMINA_AI_EDGE_MODEL_H
"""
    with open(OUTPUT_HEADER, "w") as f:
        f.write(c_header)
    print(f"[AI Trainer] Exported C-header to: {OUTPUT_HEADER}")
    
    return weights_dict

if __name__ == "__main__":
    train_and_export()
