from flask import Flask, render_template
import joblib
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
    init_model(model)

    app.register_blueprint(predict_blueprint, url_prefix="/predict")
    app.register_blueprint(result_blueprint, url_prefix="/results")
    app.register_blueprint(user_blueprint, url_prefix="/users")

    @app.route("/")
    def index():
        return render_template("index.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5001, debug=True)