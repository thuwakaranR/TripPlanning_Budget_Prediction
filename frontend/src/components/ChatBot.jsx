import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const ChatBot = ({ showChatBot, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [confirmedPlan, setConfirmedPlan] = useState(null);

    const chatbotRef = useRef(null);

    // Load messages based on confirmed plan
    useEffect(() => {
        if (!showChatBot) return;

        const savedPlan = localStorage.getItem("confirmedPlan");
        const triggeredWithoutConfirm = localStorage.getItem("chatTriggeredWithoutConfirm");

        if (savedPlan) {
            const plan = JSON.parse(savedPlan);
            setConfirmedPlan(plan);
            setMessages([
                {
                    sender: "bot",
                    text: `Thank you for selecting Trip Plan ${plan.planNumber}!`,
                },
                {
                    sender: "bot",
                    text: `Here’s how the system works: Based on your preferences and predicted budget, we've created the most optimized travel combo for you. 💼`,
                },
                {
                    sender: "bot",
                    text: `Are you satisfied with this plan? Feel free to share any thoughts or feedback!`,
                },
            ]);
        } else if (triggeredWithoutConfirm) {
            setMessages([
                {
                    sender: "bot",
                    text: `Hi there! You didn’t confirm a trip plan.`,
                },
                {
                    sender: "bot",
                    text: `Can I assist you in customizing one? You can ask for help combining Triplane 1 and 2, or tell me what you’re looking for!`,
                },
            ]);
        } else {
            setMessages([
                {
                    sender: "bot",
                    text: `Hi! How can I help you today? 😊`,
                },
            ]);
        }

        localStorage.removeItem("chatTriggeredWithoutConfirm");
    }, [showChatBot]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        const botResponse = generateBotResponse(input);
        setTimeout(() => {
            setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
        }, 500);

        setInput("");
    };

    const generateBotResponse = (text) => {
        const lower = text.toLowerCase();
        const pkgIdMatch = text.match(/\d{2,3}\.\w{1,2}\.\d{1,3}/);

        if (
            lower.includes("triplane 1") ||
            lower.includes("triplane 2") ||
            lower.includes("custom package")
        ) {
            return "Sure! A great combo would be 3 from Triplane 1 and 2 from Triplane 2. Want me to suggest one?";
        }

        if (pkgIdMatch) {
            const matchedId = pkgIdMatch[0];
            if (confirmedPlan?.packageIDs?.includes(matchedId)) {
                return `Yes! Package ID ${matchedId} is part of your confirmed plan.`;
            } else {
                return `Package ID ${matchedId} wasn't selected. Want to replace or add it?`;
            }
        }

        if (lower.includes("thank you") || lower.includes("thanks")) {
            return "You're welcome! 😊 Enjoy your trip and let me know if you need anything else.";
        }

        if (lower.includes("not satisfied") || lower.includes("change")) {
            return "I'm sorry to hear that. Want me to help you create a better package or change your selections?";
        }

        return "I'm here to help with trip plans, Triplane options, or package IDs. Ask me anything!";
    };

    if (!showChatBot) return null;

    const chatbotContent = (
        <div
            ref={chatbotRef}
            className="bg-white border border-gray-300 rounded-2xl shadow-xl flex flex-col w-full max-w-xs"
            style={{ height: "400px", display: "flex", flexDirection: "column" }}
        >
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <FaRobot />
                    <span>TripBot Assistant</span>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close chatbot"
                    className="hover:bg-blue-700 p-1 rounded"
                >
                    <IoClose size={24} />
                </button>
            </div>

            {/* Messages */}
            <div
                className="overflow-y-auto p-4 space-y-2 flex-grow"
                style={{ flexGrow: 1 }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`text-sm p-2 rounded-xl max-w-[85%] ${msg.sender === "bot"
                                ? "bg-gray-100 text-gray-800 self-start"
                                : "bg-blue-500 text-white self-end ml-auto"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-2 border-t border-gray-300 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask anything..."
                    className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        <div
            style={{
                position: "fixed",
                bottom: 16,
                right: 16,
                zIndex: 9999,
                width: 320,
                maxWidth: "90vw",
            }}
        >
            {chatbotContent}
        </div>,
        document.body
    );
};

export default ChatBot;

