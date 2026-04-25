from flask import Flask, request, jsonify
from bridge_manager import run_guard
from system_config import SECURITY_MODEL, SUBJECTS, OBJECTS, FILES, HASHES
app = Flask(__name__)
@app.route("/")
def home():
    return "Server is running fine"
@app.route("/check-access", methods=["POST"])
def check_access():
    try:
        data = request.json

        user = data.get("user")
        file = data.get("file")
        action = data.get("action")

        # 🔹 fetch from config
        s_lvl = SUBJECTS.get(user)
        o_lvl = OBJECTS.get(file)
        file_data = FILES.get(file)
        hash_val = HASHES.get(file)

        if None in [s_lvl, o_lvl, file_data, hash_val]:
            return jsonify({"error": "Invalid user or file"}), 400

        result = run_guard(
            SECURITY_MODEL,
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