from flask import Blueprint, jsonify
from db import get_all_flows

result_blueprint = Blueprint("results", __name__)

"""
Retrieve all stored flow records from the database.

Returns:
    flask.Response: JSON response containing all recorded network flows.
"""
@result_blueprint.route("/", methods=["GET"])
def results():
    return jsonify(get_all_flows())