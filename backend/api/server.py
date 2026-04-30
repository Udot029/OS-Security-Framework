from flask import Flask, request, jsonify, make_response
from bridge_manager import run_guard
from system_config import SECURITY_MODEL, SUBJECTS, OBJECTS, FILES, HASHES

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/")
def home():
    return "Server is running fine"

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "ok", "message": "Backend connected"})

@app.route("/check-access", methods=["POST", "OPTIONS"])
def check_access():
    if request.method == "OPTIONS":
        return make_response(jsonify({}), 204)

    try:
        data = request.json

        user = data.get("user")
        file = data.get("file")
        action = data.get("action")
        policy = data.get("policy", SECURITY_MODEL)

        # 🔹 fetch from config
        s_lvl = SUBJECTS.get(user)
        o_lvl = OBJECTS.get(file)
        file_data = FILES.get(file)
        hash_val = HASHES.get(file)

        if None in [s_lvl, o_lvl, file_data, hash_val]:
            return jsonify({"error": "Invalid user or file"}), 400

        if policy not in ["bell", "biba"]:
            return jsonify({"error": "Invalid policy"}), 400

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
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True)