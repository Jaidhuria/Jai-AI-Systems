"""Run a single dummy prediction (uses ml_core). Usage: python run_dummy_predict.py"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml_core import predict_from_payload  # noqa: E402


def main():
    dummy = {
        "pregnancies": 0,
        "glucose": 120,
        "bloodPressure": 72,
        "skinThickness": 25,
        "insulin": 85,
        "bmi": 26.5,
        "pedigree": 0.45,
        "age": 35,
    }
    out = predict_from_payload(dummy)
    print(json.dumps({"input": dummy, **out}, indent=2))


if __name__ == "__main__":
    main()
