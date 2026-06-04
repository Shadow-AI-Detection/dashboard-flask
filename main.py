from flask import Flask, jsonify, request
import pandas as pd
import joblib
from flask import render_template
from db import init_db, insert_flows, delete_old_flows, get_all_flows, insert_user, get_all_users, delete_user

init_db()

app = Flask(__name__)
model = joblib.load("model.pkl")

FEATURES = [
    "FlowDuration", "DestinationPort", "TotalPackets", "TotalBytes",
    "FlowBytesPerSec", "FlowPacketsPerSec", "AveragePacketSize",
    "SourcePort", "ProtocolEncoded", "DirectionEncoded", "StateEncoded",
]

"""
Predict whether incoming network flows are AI-generated traffic.

This endpoint validates the input data, runs the prediction model,
stores the results in the database, removes outdated records, and
returns a summary of the prediction results.

Returns:
    flask.Response: JSON response containing the processing status, 
    number of analyzed flows, and detected AI-generated flows.
"""
@app.route("/predict", methods=["POST"])
def predict():
    df = pd.DataFrame(request.json)

    # verify that all the columns are included
    missing = [col for col in FEATURES if col not in df.columns]
    if missing:
        return jsonify({"error": f"Colonnes manquantes : {missing}"}), 400

    # predict
    proba = model.predict_proba(df[FEATURES])
    df["prediction"] = (proba[:, 1] >= 0.5).astype(int)
    df["confidence"] = (proba[:, 1] * 100).round(1)

    # save in the database
    records = df.fillna(0).to_dict(orient="records")
    insert_flows(records)
    delete_old_flows(days=30)

    #return jsonify({"status": "ok", "count": len(df), "ai_flows": int(preds.sum())})
    return jsonify({"status": "ok", "count": len(df), "ai_flows": int(df["prediction"].sum())})

"""
Retrieve all stored flow records from the database.

Returns:
    flask.Response: JSON response containing all recorded network flows.
"""
@app.route("/results", methods=["GET"])
def results():
    return jsonify(get_all_flows())

"""
Retrieve all users from the database.

Returns:
    flask.Response : JSON list of all registered users
"""
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(get_all_users())

"""
Create a new user in the database.

Returns:
    flask.Response : JSON object confirming successful creation.
"""
@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    insert_user(
        name=data.get("name"),
        email=data.get("email"),
        ip_address=data.get("ip_address"),
        device=data.get("device"),
    )
    return jsonify({"status": "ok"})

"""
Delete a user by ID.

Returns:
    flask.Response : JSON object confirming successful deletion
"""
@app.route("/users/<int:user_id>", methods=["DELETE"])
def remove_user(user_id):
    delete_user(user_id)
    return jsonify({"status": "ok"})

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(port=5001, debug=True)