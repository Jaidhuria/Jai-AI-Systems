"""
Single long-lived process: reads one JSON line per request, writes one JSON line.
Imports ml_core / chat_core only when needed so startup never dies before the stdin loop.
"""
import json
import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def handle_request(req):
    cmd = req.get("cmd")
    body = req.get("body") or {}

    if cmd == "predict":
        try:
            from ml_core import predict_from_payload
        except Exception as e:
            return {
                "ok": False,
                "error": f"ML import/load failed: {e}. Run: pip install -r requirements.txt (in python-service) and ensure diabetes.csv or .pkl files exist.",
            }
        try:
            data = predict_from_payload(body)
            return {"ok": True, "data": data}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    if cmd == "chat":
        try:
            from chat_core import get_chat_response
        except Exception as e:
            return {
                "ok": False,
                "error": f"Chat import failed: {e}. Run: pip install -r requirements.txt",
            }
        msg = body.get("message", "")
        if not msg:
            return {"ok": False, "error": "Message is required"}
        try:
            return {"ok": True, "data": {"reply": get_chat_response(msg)}}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    return {"ok": False, "error": f"Unknown cmd: {cmd}"}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError as e:
            out = {"ok": False, "error": f"Invalid JSON: {e}"}
        else:
            try:
                out = handle_request(req)
            except Exception as e:
                out = {
                    "ok": False,
                    "error": str(e),
                    "trace": traceback.format_exc(),
                }
        sys.stdout.write(json.dumps(out) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(json.dumps({"ok": False, "error": f"Worker fatal: {e}", "trace": traceback.format_exc()}), file=sys.stderr)
        sys.exit(1)
