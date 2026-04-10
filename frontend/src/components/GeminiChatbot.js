import React, { useState } from 'react';
import './GeminiChatbot.css';
import GeminiLogo from './GeminiLogo';
import API from '../api';

const GeminiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am Gemini. How can I help you today with your career or the portal?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await API.post('/public/chat', {
                question: userMsg
            });

            const data = response.data;
            setMessages(prev => [...prev, { role: 'ai', text: data.answer || "I'm sorry, I couldn't process that. Try asking about your resume or interview tips!" }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to Gemini. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`gemini-chatbot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="gemini-chat-toggle" onClick={toggleChat}>
                    <div className="gemini-logo-icon"><GeminiLogo width={16} height={16} /></div>
                    <span className="toggle-text">Ask Gemini</span>
                </button>
            )}

            {isOpen && (
                <div className="gemini-chat-window">
                    <div className="gemini-chat-header">
                        <div className="header-info">
                            <span className="gemini-sparkle"><GeminiLogo width={20} height={20} /></span>
                            <h3>Gemini AI</h3>
                        </div>
                        <button className="close-chat" onClick={toggleChat}>×</button>
                    </div>

                    <div className="gemini-chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`gemini-msg ${m.role}`}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div className="gemini-msg ai thinking">Gemini is thinking...</div>}
                    </div>

                    <div className="gemini-chat-input">
                        <input
                            type="text"
                            placeholder="Ask anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={loading}>
                            {loading ? '...' : '→'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeminiChatbot;
