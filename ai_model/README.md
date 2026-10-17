# LuminaAI — AI Traffic Model & Hierarchical Fault Engine

**Authority:** Smart Cities Mission & Directorate of Urban Local Bodies  
**Specification:** Aligned directly with [`brain/ai_config.md`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/brain/ai_config.md)  
**Trained Artifact:** [`traffic_model_weights.json`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/ai_model/traffic_model_weights.json) & [`edge_model.h`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/ai_model/edge_model.h)  

---

## 1. Overview & Dual Operational Tasks

In strict accordance with `brain/ai_config.md`, the AI architecture delivers two primary capabilities:

### A. Predictive Adaptive Brightness (Ridge Regression)
* **Dataset Ingested:** [UCI Metro Interstate Traffic Volume Dataset](https://archive.ics.uci.edu/ml/machine-learning-databases/00492/Metro_Interstate_Traffic_Volume.csv.gz) (48,204 historical telemetry records).
* **Operational Paradigm:** Rather than waiting for motion to occur (which is purely reactive), the model proactively elevates base illumination (e.g., from **20% to 55–65%**) just before predicted rush hours based on time of day, day of week, and temperature.
* **Reactive Overrides:** Microwave radar/PIR sensors handle the immediate 85–100% reactive surges when vehicles or pedestrians approach.
* **Safety Cutoffs:** Daylight ambient lux $\ge 50.0\text{ lx}$ triggers automated 0% shutdown. Late-night quiet hours preserve an IRC:SP:72 minimum 20% security floor.

### B. Hierarchical Fault Pinpointing (3-Tier Cluster Topology)
Analyzes incoming telemetry signatures across three distinct structural tiers:
* **Tier 1: Master Cluster (`zone_id` e.g. `ZONE-GATEWAY-01`):** 4G/LTE Gateway. Distributes AI weights locally.
* **Tier 2: Mini-Cluster (`mini_cluster_id` e.g. `MC-NORTH-BOUND-A`):** ESP-NOW mesh of 15–20 street fixtures.
* **Tier 3: Pole Node (`pole_id` e.g. `PL-042`):** Individual physical fixture.

#### Fault Isolation Logic:
1. **Single Pole Anomaly:** When a single pole draws $0\text{ Amps}$ under active command while adjacent poles in the same mini-cluster draw normal current $\implies$ flags `WARNING: LED Driver Fault at PL-042`.
2. **Mini-Cluster Anomaly:** When all poles across a mini-cluster simultaneously lose power or drop telemetry $\implies$ flags `CRITICAL: Grid Power Failure or Transformer Blowout at MC-NORTH-BOUND-A`.

---

## 2. Trained Model Weights & Metrics

* **Algorithm:** Scikit-Learn `Ridge(alpha=1.0)` with cyclical diurnal harmonic encoding ($\sin, \cos$).
* **Training Records:** 38,555 training samples (from 48,204 total UCI records).
* **$R^2$ Score:** `0.7143`
* **RMSE:** `1064.40` vehicles/hour
* **MAE:** `826.52` vehicles/hour

```json
{
  "intercept": 756.076,
  "coefficients": {
    "hour": 60.933,
    "sin_hour": -207.207,
    "cos_hour": -2079.068,
    "day_of_week": 66.587,
    "is_weekend": -1200.892,
    "temp": 6.988
  }
}
```

---

## 3. Backend Integration Architecture

The trained AI model connects directly to the Node.js / Express.js backend via:
* **[`backend/services/aiInferenceService.js`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/backend/services/aiInferenceService.js):** Loads `traffic_model_weights.json` on startup. Executes proactive traffic density calculation and computes commanded dimming levels in sub-2ms.
* **[`backend/services/anomalyService.js`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/backend/services/anomalyService.js):** Evaluates hierarchical cluster telemetry to distinguish single fixture driver failure from mini-cluster feeder line blackouts.
* **[`backend/controllers/telemetryController.js`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/backend/controllers/telemetryController.js):** Ingests the exact 3-tier JSON structure:
  ```json
  {
    "zone_id": "ZONE-GATEWAY-01",
    "mini_cluster_id": "MC-NORTH-BOUND-A",
    "pole_id": "PL-042",
    "timestamp": "2026-10-16T20:45:00Z",
    "sensors": {
      "lux": 12.5,
      "motion": true,
      "power_w": 145.2,
      "current_a": 0.63
    },
    "current_ai_brightness": 85
  }
  ```

---

## 4. Edge Embedded Deployment (`edge_model.h`)

For ESP32 / Arduino microcontrollers, the C-header `edge_model.h` allows offline, autonomous local execution on low-cost hardware:
```c
#include "edge_model.h"

// Calculate dimming in sub-1 millisecond directly inside fixture firmware:
int brightness = lumina_compute_brightness(current_lux, motion_flag, current_hour, current_dow, temp_c);
analogWrite(PWM_PIN, (brightness * 255) / 100);
```
