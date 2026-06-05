from flask import Blueprint, jsonify, request
from db import insert_user, get_all_users, delete_user

user_blueprint = Blueprint("users", __name__)

"""
Retrieve all users from the database.

Returns:
    flask.Response : JSON list of all registered users
"""
@user_blueprint.route("/", methods=["GET"])
def get_users():
    return jsonify(get_all_users())

"""
Create a new user in the database.

Returns:
    flask.Response : JSON object confirming successful creation.
"""
@user_blueprint.route("/", methods=["POST"])
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
@user_blueprint.route("/<int:user_id>", methods=["DELETE"])
def remove_user(user_id):
    delete_user(user_id)
    return jsonify({"status": "ok"})