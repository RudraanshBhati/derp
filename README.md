# 🌊 Groundwater Level Prediction using LSTM

Deep learning model for predicting seasonal groundwater levels in Haryana, India using Long Short-Term Memory (LSTM) neural networks.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📖 Overview

This project implements an AI-powered system to predict groundwater levels 6 months ahead with **75% accuracy**, enabling proactive water resource management for agricultural planning in Haryana state.

### Key Highlights
- **31,517** historical observations from **847 monitoring wells**
- **31 years** of data (1990-2020) across **22 districts**
- **30 engineered features** from rainfall, temperature, and location data
- **Seasonal prediction** capability (Jan → Nov monsoon impact forecasting)

---

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/groundwater-lstm.git
cd groundwater-lstm

# Install dependencies
pip install -r requirements.txt
```

### Basic Usage
```python
from groundwater_lstm import HaryanaGroundwaterLSTM
import pandas as pd

# Load data
df = pd.read_csv('groundwater_data.csv')

# Initialize and train model
model = HaryanaGroundwaterLSTM(sequence_length=6, lstm_units=64)
model.prepare_data(df)
history = model.train_model(epochs=100)

# Evaluate performance
results = model.evaluate_model()
model.plot_results(results, history)

# Predict seasonal transition (Jan to Nov)
prediction = model.predict_seasonal_transition(well_data, from_month=1, to_month=11)
```

---

## 📊 Dataset

| Parameter | Value |
|-----------|-------|
| **Total Records** | 31,517 observations |
| **Monitoring Wells** | 847 unique locations |
| **Time Period** | 1990-2020 (31 years) |
| **Districts Covered** | 22 across Haryana |
| **Sampling Pattern** | 5 months/year (Jan, Apr, May, Aug, Nov) |
| **Features** | 30 (rainfall, temperature, geographic, temporal) |

### Feature Categories
- **Rainfall** (13): Current rainfall + 6 lag features + aggregates
- **Temperature** (12): Multi-atmospheric level data with lags
- **Geographic** (2): Latitude, Longitude
- **Temporal** (3): Cyclical month encoding + year trend

---

## 🏗️ Model Architecture
```
Input: (6 time steps, 30 features)
    ↓
LSTM(64 units) + BatchNorm + Dropout(0.3)
    ↓
LSTM(32 units) + BatchNorm + Dropout(0.3)
    ↓
LSTM(16 units) + BatchNorm + Dropout(0.3)
    ↓
Dense(32) + Dense(16) + Dropout(0.15)
    ↓
Output: Water level prediction (meters)
```

**Key Features:**
- Multi-layer LSTM for temporal pattern learning
- Location-aware sequences maintaining spatial-temporal integrity
- Early stopping and learning rate scheduling
- Batch normalization for stable training

---

## 📈 Results

### Performance Metrics

| Dataset | R² Score | RMSE (m) | MAE (m) |
|---------|----------|----------|---------|
| Training | 0.78 | 3.9 | 2.9 |
| Validation | 0.76 | 4.1 | 3.0 |
| **Test** | **0.75** | **4.2** | **3.1** |

### Highlights
- ✅ **75% accuracy** in explaining groundwater variance
- ✅ Average prediction error of **3.1 meters**
- ✅ Top wells achieve **R² > 0.85**
- ✅ Successful **Jan→Nov seasonal forecasting**

---

## 🗺️ Features

- **Seasonal Prediction**: Forecast post-monsoon water levels from pre-monsoon data
- **Interactive Maps**: Folium-based visualization of 847 wells with color coding
- **Performance Analysis**: District-wise and well-specific performance metrics
- **Model Persistence**: Save/load trained models for deployment
- **Batch Predictions**: Generate reports for multiple wells simultaneously

---

## 📁 Project Structure
```
groundwater-lstm/
├── data/
│   └── groundwater_data.csv          # Dataset
├── models/
│   ├── haryana_groundwater_lstm.py   # Main model code
│   └── saved_models/                 # Trained models
├── visualizations/
│   ├── create_maps.py                # Interactive map generation
│   └── plot_results.py               # Performance plots
├── requirements.txt                  # Dependencies
├── train_model.py                    # Training script
└── README.md                         # This file
```

---

## 🛠️ Requirements
```
python >= 3.8
tensorflow >= 2.8.0
pandas >= 1.3.0
numpy >= 1.21.0
scikit-learn >= 1.0.0
matplotlib >= 3.4.0
seaborn >= 0.11.0
folium >= 0.12.0
```

---

## 🌍 Applications

- **Agricultural Planning**: Crop selection based on water availability predictions
- **Drought Preparedness**: Early warning system for water scarcity
- **Water Resource Management**: Data-driven allocation decisions
- **Policy Making**: Evidence-based groundwater governance

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

⭐ **Star this repository if you find it helpful!**