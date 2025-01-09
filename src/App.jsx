import React, { useState, useRef, useEffect } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hey there! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { type: "user", text: input }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: input,
              },
            ],
          },
        ],
      };

      console.log("API Key:", apiKey);
      console.log("Request Payload:", payload);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDOB_ICYzgftmrFCVqeLj4NEG5rKtaQ100`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        const botReply =
          response.data.candidates[0].content.parts[0].text || "No response";
        setMessages((prev) => [...prev, { type: "bot", text: botReply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "I'm not sure how to respond to that." },
        ]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Headers:", error.response.headers);
      }
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Something went wrong. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>

        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.type === "bot" ? "bot-message" : "user-message"
              }`}
            >
              {msg.type === "bot" && <ChatbotIcon />}
              <p className="message-text">{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">Typing...</p>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              placeholder="Type a message..."
              className="message-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              className="material-symbols-rounded"
              disabled={isLoading}
            >
              send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
