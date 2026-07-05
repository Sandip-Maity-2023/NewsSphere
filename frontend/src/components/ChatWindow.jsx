import React, { useEffect, useRef, useState } from "react";

const ChatbotWindow = ({ onClose, newsData = [] }) => {
  const SYSTEM_INSTRUCTION =
    "You are a helpful news assistant. Keep answers short and friendly.Speak like female and her voice";

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [includeHeadlines, setIncludeHeadlines] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Setup voice recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + text : text));
    };

    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported.");
      return;
    }
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speakText = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    synthRef.current.cancel();
    synthRef.current.speak(utter);
  };

  // ======================
  // GOOGLE GEMINI FRONTEND CALL
  // ======================
  const callGemini = async (userText) => {
  setLoading(true);

  try {
    let fullPrompt = SYSTEM_INSTRUCTION + "\n\n";

    if (includeHeadlines && newsData.length > 0) {
      const top = newsData
        .slice(0, 5)
        .map((a, i) => `${i + 1}. ${a.title}`)
        .join("\n");

      fullPrompt += "Recent Headlines:\n" + top + "\n\n";
    }

    fullPrompt += "Conversation:\n";
    messages.forEach((m) => {
      fullPrompt += `${m.role === "user" ? "User" : "Assistant"}: ${m.text}\n`;
    });

    fullPrompt += `User: ${userText}\nAssistant: `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a reply (API returned empty).";

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: aiText },
    ]);

    speakText(aiText);
  } catch (err) {
    console.error("Gemini Error:", err);
    const errMsg = "Gemini request failed (check API key or domain restrictions).";
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: errMsg },
    ]);
    speakText(errMsg);
  } finally {
    setLoading(false);
  }
};


  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    await callGemini(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    synthRef.current.cancel();
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "25px",
        bottom: "85px",
        width: "360px",
        maxWidth: "92vw",
        height: "520px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        padding: "12px",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontWeight: "bold",
        }}
      >
        AI Chatbot
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={includeHeadlines}
              onChange={(e) => setIncludeHeadlines(e.target.checked)}
            />{" "}
            Headlines
          </label>

          <button
            onClick={clearConversation}
            style={{
              background: "#eee",
              border: "none",
              padding: "6px 8px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            onClick={() => {
              synthRef.current.cancel();
              onClose();
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✖
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f8f8f8",
          padding: 8,
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: "40%" }}>
            How can I help you today?
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                background: m.role === "user" ? "#0b74ff" : "#e5e5e5",
                color: m.role === "user" ? "#fff" : "#222",
                padding: "8px 12px",
                borderRadius: 12,
                fontSize: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: listening ? "#ff4d4f" : "#eee",
            fontSize: 18,
          }}
        >
          🎙️
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          style={{
            flex: 1,
            height: 40,
            padding: "8px",
            borderRadius: 20,
            border: "1px solid #ddd",
            resize: "none",
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "0 16px",
            height: 40,
            borderRadius: 20,
            background: "#0b74ff",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWindow;
