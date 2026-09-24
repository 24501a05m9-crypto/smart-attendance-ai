import os
import sys
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smart_attendance_ml")

app = FastAPI(
    title="Smart Attendance ML Service",
    description="Python FastAPI service serving the trained Random Forest model for attendance forecasting and leave impact simulation.",
    version="1.0.0"
)

# Enable CORS for frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURE_NAMES = [
    "july_overall_attendance",
    "july_total_conducted",
    "july_total_attended",
    "july_total_missed",
    "july_avg_subject_attendance",
    "july_min_subject_attendance",
    "july_max_subject_attendance",
    "july_std_subject_attendance",
    "july_subjects_below_75",
    "july_subjects_below_65",
    "july_subjects_count",
    "cohort"
]

MODEL_PATHS = [
    os.path.join(os.path.dirname(__file__), "models", "smart_attendance_model.pkl"),
    os.path.join(os.path.dirname(__file__), "..", "ml-service-models", "smart_attendance_model.pkl"),
    os.path.join(os.getcwd(), "ml-service", "models", "smart_attendance_model.pkl"),
    os.path.join(os.getcwd(), "ml-service-models", "smart_attendance_model.pkl"),
]

model = None
feature_importances_dict = {}

def load_ml_model():
    global model, feature_importances_dict
    for p in MODEL_PATHS:
        if os.path.exists(p):
            try:
                logger.info(f"Loading trained model from: {p}")
                model = joblib.load(p)
                logger.info("Successfully loaded trained scikit-learn Pipeline!")
                
                # Extract feature importances if available
                if hasattr(model, "named_steps") and "model" in model.named_steps:
                    rf = model.named_steps["model"]
                    preprocessor = model.named_steps.get("preprocessor")
                    if preprocessor and hasattr(preprocessor, "named_transformers_") and "cohort" in preprocessor.named_transformers_:
                        cohort_trans = preprocessor.named_transformers_["cohort"]
                        cat_names = list(cohort_trans.get_feature_names_out(["cohort"]))
                        num_names = [f for f in FEATURE_NAMES if f != "cohort"]
                        all_names = cat_names + num_names
                        if hasattr(rf, "feature_importances_") and len(rf.feature_importances_) == len(all_names):
                            for name, imp in zip(all_names, rf.feature_importances_):
                                feature_importances_dict[name] = round(float(imp) * 100, 2)
                return
            except Exception as e:
                logger.error(f"Error loading model from {p}: {e}")
                raise e
    raise FileNotFoundError(f"Trained model not found in any expected location: {MODEL_PATHS}")

# Load model at startup
load_ml_model()

class AttendanceFeatures(BaseModel):
    july_overall_attendance: float = Field(..., ge=0, le=100, description="Overall current attendance percentage")
    july_total_conducted: int = Field(..., gt=0, description="Total classes conducted across all subjects")
    july_total_attended: int = Field(..., ge=0, description="Total classes attended across all subjects")
    july_total_missed: int = Field(..., ge=0, description="Total classes missed")
    july_avg_subject_attendance: float = Field(..., ge=0, le=100, description="Average attendance across subjects")
    july_min_subject_attendance: float = Field(..., ge=0, le=100, description="Minimum subject attendance")
    july_max_subject_attendance: float = Field(..., ge=0, le=100, description="Maximum subject attendance")
    july_std_subject_attendance: float = Field(..., ge=0, description="Standard deviation of subject attendance")
    july_subjects_below_75: int = Field(..., ge=0, description="Number of subjects with attendance < 75%")
    july_subjects_below_65: int = Field(..., ge=0, description="Number of subjects with attendance < 65%")
    july_subjects_count: int = Field(..., gt=0, description="Total number of subjects")
    cohort: str = Field(..., description="Academic cohort representation (e.g., '2-1', '3-1', '4-1')")

class PredictResponse(BaseModel):
    september_prediction: float
    october_forecast: float
    risk_level: str
    risk_explanation: str

class LeaveSimulateRequest(BaseModel):
    features: AttendanceFeatures
    classes_to_miss: int = Field(..., ge=0, description="Number of upcoming classes the student considers missing")

class LeaveDataPoint(BaseModel):
    classes_missed: int
    attendance_after_leave: float
    predicted_future_attendance: float
    risk_level: str

class LeaveSimulateResponse(BaseModel):
    current_attendance: float
    classes_missed: int
    attendance_after_leave: float
    predicted_future_attendance: float
    risk_level: str
    maximum_safe_leave: int
    max_safe_leave_message: str
    trajectory: List[LeaveDataPoint]


def get_risk_level(attendance: float) -> str:
    """
    Risk level is determined using attendance thresholds after the ML prediction.
    - >= 75%: Safe
    - >= 65% and < 75%: At Risk
    - < 65%: High Risk
    """
    if attendance >= 75.0:
        return "Safe"
    elif attendance >= 65.0:
        return "At Risk"
    else:
        return "High Risk"


def prepare_feature_dict(features: AttendanceFeatures) -> Dict[str, Any]:
    return {
        "july_overall_attendance": float(features.july_overall_attendance),
        "july_total_conducted": int(features.july_total_conducted),
        "july_total_attended": int(features.july_total_attended),
        "july_total_missed": int(features.july_total_missed),
        "july_avg_subject_attendance": float(features.july_avg_subject_attendance),
        "july_min_subject_attendance": float(features.july_min_subject_attendance),
        "july_max_subject_attendance": float(features.july_max_subject_attendance),
        "july_std_subject_attendance": float(features.july_std_subject_attendance),
        "july_subjects_below_75": int(features.july_subjects_below_75),
        "july_subjects_below_65": int(features.july_subjects_below_65),
        "july_subjects_count": int(features.july_subjects_count),
        "cohort": str(features.cohort)
    }


def predict_september_and_october(feat_dict: Dict[str, Any]) -> tuple[float, float]:
    """
    Uses the trained Random Forest model.
    September: Direct prediction using trained model.
    October: Future forecast projection:
      1. Get September prediction.
      2. Copy model input.
      3. Replace current overall attendance with September prediction.
      4. Replace average subject attendance with September prediction.
      5. Send modified input through trained model.
      6. Return October future forecast.
    """
    # 1. September Prediction
    df_sept = pd.DataFrame([feat_dict])[FEATURE_NAMES]
    sept_raw = float(model.predict(df_sept)[0])
    sept_pred = round(max(0.0, min(100.0, sept_raw)), 2)

    # 2. October Future Forecast
    oct_dict = feat_dict.copy()
    oct_dict["july_overall_attendance"] = sept_pred
    oct_dict["july_avg_subject_attendance"] = sept_pred
    df_oct = pd.DataFrame([oct_dict])[FEATURE_NAMES]
    oct_raw = float(model.predict(df_oct)[0])
    oct_forecast = round(max(0.0, min(100.0, oct_raw)), 2)

    return sept_pred, oct_forecast


def compute_leave_features(base: Dict[str, Any], k: int) -> Dict[str, Any]:
    new_cond = base["july_total_conducted"] + k
    new_att = base["july_total_attended"]
    new_miss = base["july_total_missed"] + k
    new_overall = (new_att / new_cond * 100.0) if new_cond > 0 else 0.0

    ratio = (new_overall / base["july_overall_attendance"]) if base["july_overall_attendance"] > 0 else 1.0
    new_avg = max(0.0, min(100.0, base["july_avg_subject_attendance"] * ratio))
    new_min = max(0.0, min(100.0, base["july_min_subject_attendance"] * ratio))
    new_max = max(0.0, min(100.0, base["july_max_subject_attendance"] * ratio))

    updated = dict(base)
    updated["july_total_conducted"] = new_cond
    updated["july_total_attended"] = new_att
    updated["july_total_missed"] = new_miss
    updated["july_overall_attendance"] = round(new_overall, 2)
    updated["july_avg_subject_attendance"] = round(new_avg, 2)
    updated["july_min_subject_attendance"] = round(new_min, 2)
    updated["july_max_subject_attendance"] = round(new_max, 2)

    return updated


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "smart-attendance-ml",
        "model_loaded": model is not None,
        "feature_count": len(FEATURE_NAMES)
    }


@app.post("/predict", response_model=PredictResponse)
def predict(features: AttendanceFeatures):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model is not loaded.")
    
    try:
        feat_dict = prepare_feature_dict(features)
        sept_pred, oct_forecast = predict_september_and_october(feat_dict)
        risk = get_risk_level(sept_pred)
        
        return PredictResponse(
            september_prediction=sept_pred,
            october_forecast=oct_forecast,
            risk_level=risk,
            risk_explanation="Risk level is determined using attendance thresholds after the ML prediction."
        )
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"ML prediction error: {str(e)}")


@app.post("/simulate-leave", response_model=LeaveSimulateResponse)
def simulate_leave(req: LeaveSimulateRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model is not loaded.")

    try:
        base_dict = prepare_feature_dict(req.features)
        current_att = round(base_dict["july_overall_attendance"], 2)

        # Compute specific leave scenario
        k = req.classes_to_miss
        updated_k = compute_leave_features(base_dict, k)
        att_after_leave = round(updated_k["july_overall_attendance"], 2)

        # Run updated features through trained model
        df_k = pd.DataFrame([updated_k])[FEATURE_NAMES]
        pred_k_raw = float(model.predict(df_k)[0])
        predicted_future = round(max(0.0, min(100.0, pred_k_raw)), 2)
        risk = get_risk_level(predicted_future)

        # Test leave values from 0 to 20 to compute maximum safe leave
        max_safe_leave = 0
        trajectory: List[LeaveDataPoint] = []

        for leave_val in range(0, 21):
            updated_feat = compute_leave_features(base_dict, leave_val)
            df_val = pd.DataFrame([updated_feat])[FEATURE_NAMES]
            val_pred = round(max(0.0, min(100.0, float(model.predict(df_val)[0]))), 2)
            val_risk = get_risk_level(val_pred)

            if leave_val <= 10:
                trajectory.append(LeaveDataPoint(
                    classes_missed=leave_val,
                    attendance_after_leave=round(updated_feat["july_overall_attendance"], 2),
                    predicted_future_attendance=val_pred,
                    risk_level=val_risk
                ))

            if val_pred >= 75.0:
                max_safe_leave = leave_val

        # Maximum safe leave message
        if max_safe_leave > 0:
            msg = f"You can safely miss up to {max_safe_leave} classes based on the current forecast."
        else:
            msg = "Based on the model forecast, your attendance is already close to or below 75%. Missing any additional classes is not recommended."

        return LeaveSimulateResponse(
            current_attendance=current_att,
            classes_missed=k,
            attendance_after_leave=att_after_leave,
            predicted_future_attendance=predicted_future,
            risk_level=risk,
            maximum_safe_leave=max_safe_leave,
            max_safe_leave_message=msg,
            trajectory=trajectory
        )
    except Exception as e:
        logger.error(f"Leave simulation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Leave simulation error: {str(e)}")


@app.get("/model-info")
def get_model_info():
    return {
        "model_name": "Random Forest Regressor",
        "pipeline": "scikit-learn ColumnTransformer (OneHotEncoder cohort) -> RandomForestRegressor",
        "n_estimators": 300,
        "min_samples_leaf": 2,
        "features": FEATURE_NAMES,
        "feature_importances_percent": feature_importances_dict,
        "evaluation_metrics": {
            "MAE": 1.94,
            "RMSE": 2.62,
            "R2": 0.891,
            "metric_description": "R² (Coefficient of Determination) represents the proportion of attendance variance explained by the model (89.1%). R² is NOT classification accuracy."
        },
        "target": "sept_overall_attendance",
        "forecast_note": "September prediction is produced by the trained Random Forest model. October is an exploratory future forecast computed by propagating forecasted September features into the model."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
