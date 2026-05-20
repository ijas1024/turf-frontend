import React, { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000"; // adjust if backend URL differs

export default function ChatPage({ bookingId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("access_token");
  const userId = parseInt(localStorage.getItem("user_id"));

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/chat/`, { headers });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/chat/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: text }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setText("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div className="chat-box" style={{ maxWidth: 500, margin: "auto" }}>
      <h5 style={{ textAlign: "center" }}>Chat</h5>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: 10 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === userId ? "flex-end" : "flex-start",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                background: msg.sender === userId ? "#007bff" : "#f1f1f1",
                color: msg.sender === userId ? "#fff" : "#000",
                borderRadius: 12,
                padding: "8px 12px",
                maxWidth: "70%",
              }}
            >
              <div>{msg.message}</div>
              <small style={{ fontSize: 10, color: "#ccc" }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: 8 }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={{ padding: "8px 14px", marginLeft: 6 }}>
          Send
        </button>
      </div>
    </div>
  );
}
