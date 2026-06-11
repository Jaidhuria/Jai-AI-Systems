import { useState, useEffect, useRef } from "react";
import { http } from "../api/http";

function ChatPage() {
  const [chats, setChats] = useState([
    { id: 1, title: "Health Chat", messages: [] }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);

      rec.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startVoice = () => recognitionRef.current?.start();

  const newChat = () => {
    const id = Date.now();
    setChats([...chats, { id, title: "New Chat", messages: [] }]);
    setActiveChatId(id);
  };

  const updateChat = (messages) => {
    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId ? { ...c, messages } : c
      )
    );
  };
  const streamText = (text, callback) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      callback(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 8);
  };

  /* 📊 INSIGHT */
  const getInsight = (text) => {
    if (text.toLowerCase().includes("glucose")) {
      return {
        title: "Glucose Insight",
        value: "70–140 mg/dL",
        note: "Maintain this range for optimal health"
      };
    }
    return null;
  };

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = {
    id: Date.now(),
    role: "user",
    text: input,
  };

  const newMessages = [...activeChat.messages, userMsg];

  updateChat(newMessages);
  setInput("");
  setTyping(true);

  try {
    const res = await http.post("/api/chat/ask", {
      message: userMsg.text,
    });

    let aiMsg = {
      id: Date.now(),
      role: "assistant",
      text: "",
    };

    // Add empty AI message first
    updateChat([...newMessages, aiMsg]);

    // Stream text properly
    streamText(res.data.reply, (chunk) => {
      aiMsg.text = chunk;

      updateChat([
        ...newMessages,
        { ...aiMsg } // 🔥 ALWAYS use updated copy
      ]);
    });

  } catch {
    updateChat([
      ...newMessages,
      {
        id: Date.now(),
        role: "assistant",
        text: "Error occurred.",
      },
    ]);
  }

  setTyping(false);
};

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <button className="new-chat" onClick={newChat}>
          + New Chat
        </button>

        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => setActiveChatId(chat.id)}
          >
            💬 {chat.title}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="chat">
        <div className="messages">
          {activeChat.messages.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              
              {/* TEXT */}
              {m.text && (
                <div className="bubble">{m.text}</div>
              )}

              {/* INSIGHT CARD */}
              {m.insight && (
                <div className="insight-card">
                  <strong>{m.insight.title}</strong>
                  <div className="insight-value">{m.insight.value}</div>
                  <small>{m.insight.note}</small>
                </div>
              )}
            </div>
          ))}

          {typing && <div className="typing">AI is thinking...</div>}
          <div ref={messagesEndRef}></div>
        </div>

        {/* INPUT */}
        <div className="input-area">
          <button
            className={`voice ${listening ? "active" : ""}`}
            onClick={startVoice}
          >
            🎤
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about health, glucose..."
          />

          <button className="send" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .app {
          display: flex;
          height: 100vh;
          background: #f8fafc;
        }

        /* SIDEBAR */
        .sidebar {
          width: 240px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 15px;
        }

        .new-chat {
          width: 100%;
          padding: 10px;
          background: #2563eb;
          color: white;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .chat-item {
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .chat-item:hover {
          background: #f1f5f9;
        }

        .chat-item.active {
          background: #e2e8f0;
          font-weight: 500;
        }

        /* CHAT */

        .chat {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .msg {
          margin-bottom: 14px;
        }

        .msg.user {
          text-align: right;
        }

        .bubble {
          display: inline-block;
          padding: 12px 16px;
          border-radius: 14px;
          background: #f1f5f9;
        }

        .msg.user .bubble {
          background: #2563eb;
          color: white;
        }

        /* INSIGHT */

        .insight-card {
          margin-top: 8px;
          padding: 12px;
          border-radius: 12px;
          background: #ecfeff;
          border-left: 4px solid #06b6d4;
        }

        .insight-value {
          font-size: 18px;
          font-weight: bold;
        }

        /* INPUT */

        .input-area {
          display: flex;
          gap: 10px;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
        }

        input {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .voice.active {
          background: #fee2e2;
        }

        .send {
          background: #2563eb;
          color: white;
          padding: 0 15px;
          border-radius: 8px;
        }

        .typing {
          font-size: 12px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

export default ChatPage;