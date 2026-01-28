import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Trash2, Reply, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';
import io from 'socket.io-client';

const socket = io.connect("https://api.dark-console.com");

const CommunityChat = () => {
  // ... (State logic කලින් විදියමයි - වෙනස් කරන්න එපා) ...
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [user, setUser] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user_info'));
    setUser(storedUser);
    apiClient.get('/community/messages').then(res => setMessages(res.data));
    socket.emit('join_community');
    socket.on('receive_community_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
    });
    socket.on('message_deleted', (id) => {
        setMessages(prev => prev.filter(m => m._id !== id));
    });
    return () => { socket.off('receive_community_message'); socket.off('message_deleted'); };
  }, []);

  const scrollToBottom = () => scrollRef.current?.scrollIntoView({ behavior: "smooth" });

  // ... (sendMessage, handleImageUpload functions කලින් විදියමයි) ...
  const sendMessage = async () => {
      if (!user) return alert("Please Login to Chat!");
      if (!text && !image) return;
      const msgData = {
          userId: user.uid,
          username: user.displayName,
          avatar: user.photoURL,
          message: text,
          image: image,
          replyTo: replyTo ? replyTo._id : null,
          isAdmin: user.role === 'admin'
      };
      socket.emit('send_community_message', msgData);
      setText(""); setImage(null); setReplyTo(null);
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      if(file) reader.readAsDataURL(file);
  };

  return (
    // 🔥 වෙනස්කම 1: Section Wrapper එක දැම්මා
    <section className="py-20 px-4 bg-[#09090b] border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
            
            {/* Title Section */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black uppercase text-white">
                    Community <span className="text-[var(--gta-green)]">Chat</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-2">Connect with other players in real-time.</p>
            </div>

            {/* Chat Container */}
            <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                
                {/* Warning Banner */}
                <div className="bg-red-500/10 border-b border-red-500/20 p-2 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wide justify-center">
                    <AlertTriangle size={14}/>
                    <span>Warning: No Hate Speech,Spam,Porn contents and Links.</span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`flex gap-3 ${msg.userId === user?.uid ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.avatar} className="w-8 h-8 rounded-full bg-zinc-800 object-cover"/>
                            <div className={`max-w-[80%] flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold ${msg.isAdmin ? 'text-[var(--gta-green)]' : 'text-zinc-500'}`}>
                                        {msg.username} {msg.isAdmin && '🛡️'}
                                    </span>
                                </div>
                                {msg.replyTo && (
                                    <div className="bg-zinc-800/50 p-1 rounded mb-1 text-[10px] text-zinc-400 border-l-2 border-[var(--gta-green)] truncate w-full">
                                        Replying to: {msg.replyTo.message}
                                    </div>
                                )}
                                <div className={`p-3 rounded-xl text-sm ${
                                    msg.isAdmin ? 'bg-[var(--gta-green)]/20 border border-[var(--gta-green)] text-white' : 
                                    msg.userId === user?.uid ? 'bg-zinc-800 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                                }`}>
                                    {msg.image && <img src={msg.image} className="rounded-lg mb-2 max-w-full"/>}
                                    <p>{msg.message}</p>
                                </div>
                                <div className="flex gap-2 mt-1 opacity-50 hover:opacity-100 transition-opacity">
                                    <button onClick={() => setReplyTo(msg)} className="text-zinc-500 hover:text-white"><Reply size={12}/></button>
                                    {(user?.role === 'admin' || user?.uid === msg.userId) && (
                                        <button onClick={() => socket.emit('delete_community_message', msg._id)} className="text-red-500"><Trash2 size={12}/></button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                    {replyTo && (
                        <div className="flex justify-between items-center text-xs text-[var(--gta-green)] mb-2 bg-black p-2 rounded">
                            <span>Replying to: {replyTo.username}</span>
                            <button onClick={() => setReplyTo(null)}>X</button>
                        </div>
                    )}
                    {image && (
                        <div className="relative w-16 h-16 mb-2">
                            <img src={image} className="w-full h-full object-cover rounded"/>
                            <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white w-4 h-4 flex items-center justify-center text-xs">×</button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <label className="cursor-pointer p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 text-zinc-400 flex items-center justify-center">
                            <Image size={20}/>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                        </label>
                        <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={user ? "Type a message..." : "Login to chat"}
                            disabled={!user}
                            className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 text-white outline-none focus:border-[var(--gta-green)]"
                        />
                        <button onClick={sendMessage} disabled={!user} className="bg-[var(--gta-green)] text-black p-3 rounded-xl font-bold hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center">
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default CommunityChat;