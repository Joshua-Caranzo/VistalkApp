from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt

app = Flask(__name__)
CORS(app)

SECRET_KEY = "your_secret_key_here"

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get("Authorization", "").split(" ")[1]
        if not token:
            return jsonify({"message": "Unauthorized!"}), 401
        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
        return f(*args, **kwargs)
    return decorator

@app.route("/login", methods=["GET"])
def login_admin():
    return jsonify({"message": "Login endpoint"})

# Additional routes...
