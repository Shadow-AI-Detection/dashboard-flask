import os
from flask import Flask, render_template, jsonify
import joblib
from flask_cors import CORS
from db import init_db
from routes.predict_routes import predict_blueprint, init_model
from routes.result_routes import result_blueprint
from routes.user_routes import user_blueprint

init_db()
model = joblib.load("model.pkl")

"""
Create and configure the Flask application. Initializes the prediction 
model, registers application blueprints, and defines the main dashboard route.

Returns:
    Flask : Configured Flask application instance.
"""
def create_app():
    app = Flask(__name__)
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    CORS(app)
    init_model(model)

    app.register_blueprint(predict_blueprint, url_prefix="/predict")
    app.register_blueprint(result_blueprint, url_prefix="/results")
    app.register_blueprint(user_blueprint, url_prefix="/users")

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/health")
    def health():
        return jsonify({
            "status": "ok",
            "model_loaded": model is not None
        })

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port)