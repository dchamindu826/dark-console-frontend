import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Image as ImageIcon, Reply, User } from 'lucide-react';
import apiClient from '../api/client';
import io from 'socket.io-client';

// Frontend එකේ Socket එක Connect කරගන්න
const socket = io.connect("https://api.dark-console.com");

const ChatWindow = ({ order, user, onClose }) => {
    const [msg, setMsg] = useState("");
    const [image, setImage] = useState(null);
    const [list, setList] = useState([]);
    const [replyTo, setReplyTo] = useState(null);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!order || !order.chatRoomId) return;

        // 1. Room එකට Join වෙන්න
        socket.emit("join_room", order.chatRoomId);

        // 2. පරණ මැසේජ් Load කරගන්න (History Fix) 🔥
        const loadHistory = async () => {
            try {
                const { data } = await apiClient.get(`/orders/${order._id}/messages`);
                setList(data);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        loadHistory();

        // 3. Real-time මැසේජ් අහගෙන ඉන්න
        const handleReceiveMessage = (data) => {
            setList((prev) => [...prev, data]);
            scrollToBottom();
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [order]);

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async () => {
        if ((!msg.trim() && !image) || !user) return;

        const messageData = {
            orderId: order._id, // 🔥 මේක වැදගත්ම දේ (Save වෙන්න ඕන නිසා)
            room: order.chatRoomId,
            senderId: user.uid,
            senderName: user.displayName || "Customer",
            author: user.displayName || "Customer",
            message: image ? "Sent an image" : msg,
            image: image, // Image එක Base64 විදියට යවනවා
            type: image ? 'image' : 'text',
            replyTo: replyTo,
            isAdmin: false, // Customer නිසා false
            time: new Date().toLocaleTimeString(),
            createdAt: new Date().toISOString()
        };

        await socket.emit("send_message", messageData);
        
        // Frontend එකේ ඉක්මනට පෙන්නන්න (Optimistic Update)
        // Note: Socket එකෙන් return එන නිසා මේක අනිවාර්ය නෑ, ඒත් UI එකට හොඳයි
        // setList((list) => [...list, messageData]); 

        setMsg("");
        setImage(null);
        setReplyTo(null);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md h-[600px] flex flex-col rounded-2xl border border-zinc-700 shadow-2xl">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800 rounded-t-2xl">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <User size={16} className="text-[var(--gta-green)]"/> Support Chat
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Order #{order._id.slice(-4)}</p>
                    </div>
                    <button onClick={onClose} className="bg-black/50 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-red-500/20 transition-all"><X size={18}/></button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20 scrollbar-thin scrollbar-thumb-zinc-700">
                    {list.length === 0 && <p className="text-center text-zinc-600 text-xs italic mt-10">Start chatting with us...</p>}
                    
                    {list.map((m, i) => {
                        // Logic: Customer (Me) vs Admin (Them)
                        const isMe = !m.isAdmin && (m.senderId === user.uid || m.author === user.displayName);
                        
                        return (
                            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 relative text-sm ${
                                    isMe 
                                    ? 'bg-[var(--gta-green)] text-black rounded-tr-none' // Customer: Right (Green)
                                    : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700' // Admin: Left (Dark Gray)
                                }`}>
                                    
                                    {/* Admin Label */}
                                    {!isMe && <p className="text-[10px] text-blue-400 font-bold mb-1">Support Team</p>}

                                    {/* Reply Context */}
                                    {m.replyTo && (
                                        <div className={`text-[10px] mb-2 p-2 rounded border-l-2 ${isMe ? 'bg-black/10 border-black' : 'bg-black/30 border-[var(--gta-green)]'}`}>
                                            <span className="font-bold opacity-70">{m.replyTo.senderName || m.replyTo.author}</span>
                                            <p className="truncate opacity-60">{m.replyTo.image ? '📷 Image' : m.replyTo.message}</p>
                                        </div>
                                    )}

                                    {/* Image Rendering 🔥 (Images පෙන්නන කෑල්ල) */}
                                    {(m.image || m.attachment) && (
                                        <img 
                                            src={m.image || m.attachment} 
                                            alt="Shared" 
                                            className="rounded-lg mb-2 max-w-full max-h-48 object-cover cursor-pointer"
                                            onClick={() => window.open(m.image || m.attachment)}
                                        />
                                    )}

                                    {/* Text Message */}
                                    {(!m.type || m.type === 'text') && <p>{m.message}</p>}
                                    {m.type === 'image' && !m.image && <p className="italic opacity-50">Sent an image</p>}

                                    {/* Timestamp */}
                                    <span className={`text-[9px] font-bold block mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {m.senderName || m.author} • {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>

                                    {/* Reply Button */}
                                    <button 
                                        onClick={() => setReplyTo(m)}
                                        className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all`}
                                    >
                                        <Reply size={14}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-800 rounded-b-2xl">
                    
                    {/* Reply Preview */}
                    {replyTo && (
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg mb-2 border-l-2 border-[var(--gta-green)]">
                            <div className="text-xs text-zinc-300">
                                <span className="font-bold text-[var(--gta-green)]">Replying to {replyTo.senderName}:</span>
                                <p className="truncate max-w-[200px]">{replyTo.image ? '📷 Image' : replyTo.message}</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                        </div>
                    )}

                    {/* Image Preview */}
                    {image && (
                        <div className="relative w-16 h-16 mb-2">
                            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg border border-zinc-600"/>
                            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current.click()} className="bg-zinc-700 hover:bg-zinc-600 p-3 rounded-xl transition-colors text-white">
                            <ImageIcon size={20}/>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                        <input 
                            value={msg} 
                            onChange={e => setMsg(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 bg-black border border-zinc-600 p-3 rounded-xl text-white text-sm focus:border-[var(--gta-green)] outline-none transition-colors" 
                            placeholder={image ? "Add a caption..." : "Type a message..."}
                        />
                        <button onClick={sendMessage} className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black p-3 rounded-xl transition-colors">
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;