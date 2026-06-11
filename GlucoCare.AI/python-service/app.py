"""
Optional standalone Flask API (port 5001). Normal app use: Express + python_worker.py (same port as UI).
"""
from flask import Flask, request, jsonify
from flask_cors import CORS

from ml_core import predict_from_payload
from chat_core import get_chat_response

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Expected a JSON object with prediction fields"}), 400
        out = predict_from_payload(data)
        return jsonify(out)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        message = data.get("message", "")
        if not message:
            return jsonify({"error": "Message is required"}), 400
        return jsonify({"reply": get_chat_response(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Optional Flask API — prefer Express + python_worker for single port"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
