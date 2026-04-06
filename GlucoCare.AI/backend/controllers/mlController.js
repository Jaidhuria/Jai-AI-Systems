const { invokePredict } = require("../utils/pythonBridge");

exports.predictDiabetes = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "JSON body is required", message: "JSON body is required" });
    }

    const data = await invokePredict(req.body);
    return res.json(data);
  } catch (error) {
    console.error("[ml/predict]", error.message);
    const msg = error.message || "Prediction failed";
    return res.status(400).json({ error: msg, message: msg });
  }
};
