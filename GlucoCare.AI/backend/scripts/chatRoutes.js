const express = require("express");
const router = express.Router();

/* ---------------- CHAT API ---------------- */

router.post("/ask", async (req, res) => {
  try {
    console.log("CHAT API HIT 🔥");

    const input = req.body.question || req.body.message;

    if (!input) {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    console.log("User Question:", input);

    const q = input.toLowerCase();

    /* PRIORITY MATCHING */

    if (q.includes("symptom")) {
      reply =
        "Common symptoms include frequent urination, increased thirst, fatigue, blurred vision, and slow healing wounds.";
    }

    else if (q.includes("prevent")) {
      reply =
        "Prevention includes a healthy diet, regular exercise, maintaining weight, and avoiding excess sugar.";
    }

    else if (q.includes("diet") || q.includes("food")) {
      reply =
        "Eat high-fiber foods, vegetables, whole grains, and avoid sugary drinks and processed food.";
    }

    else if (q.includes("exercise")) {
      reply =
        "Daily physical activity like walking, gym, or sports helps control blood sugar effectively.";
    }

    else if (q.includes("insulin")) {
      reply =
        "Insulin is a hormone that helps glucose enter cells for energy and regulates blood sugar.";
    }

    else if (q.includes("glucose") || q.includes("blood sugar")) {
      reply =
        "Normal fasting glucose is 70–99 mg/dL. Higher values may indicate risk.";
    }

    else if (q.includes("diabetes")) {
      reply =
        "Diabetes is a chronic condition where blood sugar levels remain high due to insulin issues.";
    }

    else if (q.includes("hello") || q.includes("hi")) {
      reply =
        "Hello! 👋 I'm your AI health assistant. Ask me anything about diabetes.";
    }

    else {
      reply =
        "I'm still learning 🤖. Try asking about symptoms, diet, prevention, or glucose levels.";
    }
    /* ---------------- RESPONSE ---------------- */

    return res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("Chat Error:", error);

    return res.status(500).json({
      reply: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;

