"""Diabetes ML — no Flask, no NLTK (used by Node worker and optional Flask app)."""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, "diabetes_model.pkl")
CALIBRATED_FILE = os.path.join(BASE_DIR, "calibrated_model.pkl")
LOCAL_DATA_FILE = os.path.join(BASE_DIR, "diabetes.csv")
LEGACY_DATA_FILE = os.path.normpath(
    os.path.join(BASE_DIR, "..", "..", "Project-exibhition", "diabetes.csv")
)
DATA_FILE = LOCAL_DATA_FILE if os.path.exists(LOCAL_DATA_FILE) else LEGACY_DATA_FILE

FEATURE_ORDER = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]


def load_or_train_model():
    if os.path.exists(MODEL_FILE) and os.path.exists(CALIBRATED_FILE):
        model = joblib.load(MODEL_FILE)
        calibrated_model = joblib.load(CALIBRATED_FILE)
        return model, calibrated_model

    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"Dataset not found: {DATA_FILE}")

    data = pd.read_csv(DATA_FILE)
    X = data[
        [
            "Pregnancies",
            "Glucose",
            "BloodPressure",
            "SkinThickness",
            "Insulin",
            "BMI",
            "DiabetesPedigreeFunction",
            "Age",
        ]
    ]
    y = data["Outcome"]

    zero_not_allowed = ["Glucose", "BloodPressure", "SkinThickness", "BMI", "Insulin"]
    for col in zero_not_allowed:
        X[col] = X[col].replace(0, np.nan)
        X[col] = X[col].fillna(X[col].median())

    X["Insulin"] = np.log1p(X["Insulin"])
    X["SkinThickness"] = np.log1p(X["SkinThickness"])

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=6,
        min_samples_split=5,
        random_state=42,
    )
    model.fit(X_train, y_train)

    calibrated_model = CalibratedClassifierCV(model, method="isotonic", cv=5)
    calibrated_model.fit(X_train, y_train)

    joblib.dump(model, MODEL_FILE)
    joblib.dump(calibrated_model, CALIBRATED_FILE)
    return model, calibrated_model


model, calibrated_model = load_or_train_model()


def get_risk_level(prob):
    if prob >= 0.75:
        return "High", "High risk! Consult a healthcare provider immediately."
    if prob >= 0.5:
        return "Moderate", "Moderate risk. Monitor glucose and consult a doctor."
    return "Low", "Low risk. Maintain a healthy lifestyle."


def preprocess_input(data):
    features = {
        "Pregnancies": float(data["pregnancies"]),
        "Glucose": float(data["glucose"]),
        "BloodPressure": float(data["bloodPressure"]),
        "SkinThickness": float(data["skinThickness"]),
        "Insulin": float(data["insulin"]),
        "BMI": float(data["bmi"]),
        "DiabetesPedigreeFunction": float(data["pedigree"]),
        "Age": float(data["age"]),
    }

    if features["Glucose"] == 0:
        features["Glucose"] = 120
    if features["BloodPressure"] == 0:
        features["BloodPressure"] = 70
    if features["BMI"] == 0:
        features["BMI"] = 25

    features["Insulin"] = np.log1p(features["Insulin"])
    features["SkinThickness"] = np.log1p(features["SkinThickness"])
    df = pd.DataFrame([features])
    return df[FEATURE_ORDER]


def predict_from_payload(data):
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object with prediction fields")

    required_fields = [
        "pregnancies",
        "glucose",
        "bloodPressure",
        "skinThickness",
        "insulin",
        "bmi",
        "pedigree",
        "age",
    ]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing field: {field}")

    features_df = preprocess_input(data)
    probability = float(calibrated_model.predict_proba(features_df)[0][1])
    prediction = int(calibrated_model.predict(features_df)[0])
    risk_level, message = get_risk_level(probability)

    warnings = []
    if float(data["glucose"]) > 125:
        warnings.append("Glucose is high")
    if float(data["bmi"]) > 30:
        warnings.append("BMI is high")

    return {
        "prediction": prediction,
        "probability": round(probability * 100, 2),
        "risk_level": risk_level,
        "message": message,
        "warnings": warnings,
    }
