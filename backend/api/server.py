from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from bridge_manager import run_guard
from chatbot import get_chatbot_reply
from system_config import SECURITY_MODEL, SUBJECTS, OBJECTS, FILES, HASHES
import logging

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.after_request
def add_headers(response):
    response.headers["Cache-Control"] = "no-cache"
    return response

@app.route("/")
def home():
    return "Server is running fine"

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "ok", "message": "Backend connected"})

@app.route("/config", methods=["GET"])
def config():
    return jsonify({
        "securityModel": SECURITY_MODEL,
        "subjects": SUBJECTS,
        "objects": OBJECTS,
        "files": list(FILES.keys()),
        "policies": ["bell", "biba"],
        "actions": ["read", "write"]
    })

@app.route("/chatbot", methods=["POST", "OPTIONS"])
def chatbot():
    if request.method == "OPTIONS":
        return make_response(jsonify({}), 204)

    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    return jsonify({
        "reply": get_chatbot_reply(message)
    })

@app.route("/check-access", methods=["POST", "OPTIONS"])
def check_access():
    if request.method == "OPTIONS":
        return make_response(jsonify({}), 204)

    try:
        data = request.get_json(silent=True) or {}

        user = data.get("user")
        file = data.get("file")
        action = data.get("action")
        policy = data.get("policy", SECURITY_MODEL)

        if action not in ["read", "write"]:
            return jsonify({
                "allowed": False,
                "output": "",
                "error": "Invalid action",
                "code": 400
            }), 400

        s_lvl = SUBJECTS.get(user)
        o_lvl = OBJECTS.get(file)
        file_data = FILES.get(file)
        hash_val = HASHES.get(file)

        if None in [s_lvl, o_lvl, file_data, hash_val]:
            return jsonify({
                "allowed": False,
                "output": "",
                "error": "Invalid user or file",
                "code": 400
            }), 400

        if policy not in ["bell", "biba"]:
            return jsonify({
                "allowed": False,
                "output": "",
                "error": "Invalid policy",
                "code": 400
            }), 400

        result = run_guard(
            policy,
            s_lvl,
            o_lvl,
            action,
            file_data,
            hash_val
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "allowed": False,
            "output": "",
            "error": str(e),
            "code": 500
        }), 500
if __name__ == "__main__":
    
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,  
        use_reloader=False, 
        threaded=True 
    )
