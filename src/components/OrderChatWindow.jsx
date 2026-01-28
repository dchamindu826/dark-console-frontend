import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Shield } from 'lucide-react';
import apiClient from '../api/client';
import io from 'socket.io-client';

const socket = io.connect("https://api.dark-console.com");

const OrderChatWindow = ({ orderId, currentUser, isCustomerView }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        // 1. Load History
        apiClient.get(`/orders/${orderId}/messages`).then(res => setMessages(res.data));

        // 2. Join Room
        socket.emit('join_order_chat', orderId);

        // 3. Listen for Messages
        socket.on('receive_order_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
        });

        return () => { socket.off('receive_order_message'); };
    }, [orderId]);

    const scrollToBottom = () => scrollRef.current?.scrollIntoView({ behavior: "smooth" });

    const sendMessage = async () => {
        if (!text.trim()) return;

        const msgData = {
            orderId,
            senderId: currentUser._id || currentUser.uid,
            senderName: currentUser.username || currentUser.displayName || "User",
            message: text,
            isAdmin: !isCustomerView // If component used by Admin, set True
        };

        socket.emit('send_order_message', msgData);
        setText("");
    };

    return (
        <div className="flex flex-col h-[500px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-black p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-white font-bold uppercase text-sm">
                    {isCustomerView ? "Chat with Agent" : "Chat with Customer"}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--gta-green)] rounded-full animate-pulse"></div>
                    <span className="text-zinc-500 text-xs">Live</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => {
                    // Logic to decide left/right alignment
                    const isMe = isCustomerView ? !msg.isAdmin : msg.isAdmin;
                    
                    return (
                        <div key={index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isAdmin ? 'bg-[var(--gta-green)] text-black' : 'bg-blue-600 text-white'}`}>
                                {msg.isAdmin ? <Shield size={16}/> : <User size={16}/>}
                            </div>
                            
                            <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                                isMe ? 'bg-zinc-800 text-white' : 'bg-black border border-zinc-800 text-zinc-300'
                            }`}>
                                <p className="text-[10px] font-bold opacity-50 mb-1">{msg.senderName}</p>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black border-t border-zinc-800 flex gap-2">
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 text-white text-sm focus:border-[var(--gta-green)] outline-none"
                />
                <button onClick={sendMessage} className="bg-[var(--gta-green)] text-black p-2 rounded-lg hover:bg-emerald-500">
                    <Send size={18}/>
                </button>
            </div>
        </div>
    );
};

export default OrderChatWindow;