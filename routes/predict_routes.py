from flask import Blueprint, jsonify, request
import pandas as pd
from db import insert_flows, delete_old_flows

predict_blueprint = Blueprint("predict", __name__)
model = None

FEATURES = [
    "FlowDuration", "DestinationPort", "TotalPackets", "TotalBytes",
    "FlowBytesPerSec", "FlowPacketsPerSec", "AveragePacketSize",
    "SourcePort", "ProtocolEncoded", "DirectionEncoded", "StateEncoded",
]

"""
Initialize the global machine learning model instance.

Args:
    m : Trained model used for traffic prediction.
"""
def init_model(m):
    global model
    model = m

"""
Predict whether incoming network flows are AI-generated traffic.

This endpoint validates the input data, runs the prediction model,
stores the results in the database, removes outdated records, and
returns a summary of the prediction results.

Returns:
    flask.Response: JSON response containing the processing status, 
    number of analyzed flows, and detected AI-generated flows.
"""
@predict_blueprint.route("/", methods=["POST"])
def predict():
    payload = request.json

    # 422: malformed or empty input
    if not payload or not isinstance(payload, list):
        return jsonify({"error": "Request body must be a non-empty JSON array of flow objects"}), 422

    try:
        df = pd.DataFrame(payload)
    except Exception:
        return jsonify({"error": "Could not parse input data"}), 422

    # 422: missing required features
    missing = [col for col in FEATURES if col not in df.columns]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 422

    try:
        proba = model.predict_proba(df[FEATURES])
        df["prediction"] = (proba[:, 1] >= 0.5).astype(int)
        df["confidence"] = (proba[:, 1] * 100).round(1)

        records = df.fillna(0).to_dict(orient="records")
        insert_flows(records)
        delete_old_flows(days=30)

        return jsonify({"status": "ok", "count": len(df), "ai_flows": int(df["prediction"].sum())})
    except Exception:
        return jsonify({"error": "Internal server error during prediction"}), 500