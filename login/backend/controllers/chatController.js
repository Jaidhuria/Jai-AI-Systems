const { invokeChat } = require("../utils/pythonBridge");

exports.askChat = async (req, res) => {
  try {
    const data = await invokeChat({ message: req.body?.message || "" });
    return res.json({ reply: data.reply });
  } catch (error) {
    const msg = error.message || "Chat failed";
    console.error("[chat]", msg);
    return res.status(400).json({ reply: msg });
  }
};
