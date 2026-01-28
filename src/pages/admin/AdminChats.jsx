import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Calendar, Send, Trash2, Image as ImageIcon, Reply, X, Headset } from 'lucide-react';
import apiClient from '../../api/client';
import io from 'socket.io-client';

const socket = io.connect("https://api.dark-console.com");

const AdminChats = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // inbox, community, events
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [adminName, setAdminName] = useState("Admin");
  
  // Data Lists
  const [activeOrders, setActiveOrders] = useState([]);
  const [events, setEvents] = useState([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
      // Get Admin Name
      const admin = JSON.parse(localStorage.getItem('adminInfo'));
      if(admin) setAdminName(admin.username);

      // Fetch Lists
      apiClient.get('/orders?status=in_progress').then(res => setActiveOrders(res.data));
      apiClient.get('/events').then(res => setEvents(res.data));
  }, []);

  // --- JOIN ROOM & LOAD HISTORY ---
  const handleSelectRoom = async (roomName, type, label) => {
      setSelectedRoom({ id: roomName, type, label });
      setMessages([]); 
      setReplyTo(null);
      
      socket.emit("join_room", roomName);

      try {
          const { data } = await apiClient.get(`/chats/${roomName}`);
          setMessages(data);
          scrollToBottom();
      } catch (err) {
          console.error("Failed to load chat history");
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- SEND MESSAGES ---
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => sendMessage(null, reader.result);
          reader.readAsDataURL(file);
      }
  };

  const sendMessage = (e, imgData = null) => {
      if (e) e.preventDefault();
      
      if ((!input.trim() && !imgData) || !selectedRoom) return;

      const data = {
          room: selectedRoom.id,
          author: adminName,
          message: imgData ? "Sent an image" : input,
          type: imgData ? 'image' : 'text', // Check logic
          attachment: imgData,
          replyTo: replyTo,
          createdAt: new Date().toISOString()
      };

      socket.emit("send_message", data);
      
      // Local Append (Socket listener will handle this, but for instant feedback):
      // setMessages(m => [...m, data]); 
      
      setInput("");
      setReplyTo(null);
  };

  // --- SOCKET LISTENER ---
  useEffect(() => {
      socket.off("receive_message").on("receive_message", (data) => {
          if (selectedRoom && data.room === selectedRoom.id) {
              setMessages(m => [...m, data]);
              scrollToBottom();
          }
      });
  }, [selectedRoom]);

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
        
        {/* SIDEBAR LIST */}
        <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-black uppercase text-white mb-4">Communications</h2>
                <div className="flex gap-2 bg-black p-1 rounded-lg">
                    {['inbox', 'community', 'events'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => { setActiveTab(tab); setSelectedRoom(null); }}
                            className={`flex-1 py-2 rounded text-xs font-bold uppercase ${activeTab === tab ? 'bg-[var(--gta-green)] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {/* INBOX (Orders) */}
                {activeTab === 'inbox' && activeOrders.map(order => (
                    <div key={order._id} onClick={() => handleSelectRoom(order.chatRoomId, 'inbox', order.customer.name)} className={`p-4 rounded-lg cursor-pointer border-b border-zinc-800/50 mb-1 ${selectedRoom?.id === order.chatRoomId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                        <p className="text-white font-bold text-sm">{order.customer.name}</p>
                        <p className="text-zinc-500 text-xs">Order #{order._id.slice(-4)}</p>
                    </div>
                ))}

                {/* COMMUNITY */}
                {activeTab === 'community' && (
                    <div onClick={() => handleSelectRoom('community_global', 'community', 'Global Chat')} className={`p-4 rounded-lg cursor-pointer ${selectedRoom?.id === 'community_global' ? 'bg-white/10' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                        <p className="text-white font-bold flex items-center gap-2"><Users size={16}/> Global Chat</p>
                        <p className="text-zinc-500 text-xs mt-1">Public for all users</p>
                    </div>
                )}

                {/* EVENTS */}
                {activeTab === 'events' && events.map(event => (
                    <div key={event._id} onClick={() => handleSelectRoom(`event_${event._id}`, 'events', event.title)} className={`p-4 rounded-lg cursor-pointer border-b border-zinc-800/50 mb-1 ${selectedRoom?.id === `event_${event._id}` ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                        <p className="text-white font-bold text-sm">{event.title}</p>
                        <p className="text-[var(--gta-green)] text-xs uppercase font-bold">{event.mode}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-black">
            {selectedRoom ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider">{selectedRoom.label}</h3>
                            <p className="text-zinc-500 text-xs font-mono">{selectedRoom.id}</p>
                        </div>
                        <button className="text-red-500 text-xs font-bold uppercase flex items-center gap-1 hover:text-white"><Trash2 size={14}/> Clear Chat</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0a0a0a]">
                        {messages.map((m, i) => {
                            const isMe = m.author === adminName;
                            return (
                                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-3 relative group ${isMe ? 'bg-[var(--gta-green)] text-black rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none'}`}>
                                        
                                        {/* Reply Context */}
                                        {m.replyTo && (
                                            <div className={`text-[10px] mb-2 p-2 rounded border-l-2 ${isMe ? 'bg-black/10 border-black' : 'bg-black/20 border-[var(--gta-green)]'}`}>
                                                <span className="font-bold opacity-70">{m.replyTo.author}</span>
                                                <p className="truncate opacity-60">{m.replyTo.message}</p>
                                            </div>
                                        )}

                                        {/* Content */}
                                        {m.type === 'image' ? (
                                            <img src={m.attachment} className="w-full rounded-lg max-h-60 object-cover cursor-pointer" onClick={()=>window.open(m.attachment)}/>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                                        )}

                                        <span className={`text-[9px] font-bold block mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {m.author} • {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </span>

                                        {/* Reply Button (Hover) */}
                                        <button 
                                            onClick={() => setReplyTo({ id: m._id, author: m.author, message: m.message })}
                                            className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 bg-zinc-800 p-1 rounded-full text-zinc-400 hover:text-white transition-all`}
                                        >
                                            <Reply size={12}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                        {replyTo && (
                            <div className="flex justify-between items-center bg-black/50 p-2 rounded-lg mb-2 border-l-2 border-[var(--gta-green)]">
                                <div className="text-xs text-zinc-400">Replying to <span className="text-[var(--gta-green)]">{replyTo.author}</span></div>
                                <button onClick={() => setReplyTo(null)} className="text-white hover:text-red-500"><X size={14}/></button>
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <button onClick={() => fileInputRef.current.click()} className="bg-zinc-800 p-3 rounded-xl text-zinc-400 hover:text-white transition-all">
                                <ImageIcon size={20}/>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                            <input 
                                value={input} 
                                onChange={e => setInput(e.target.value)} 
                                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..." 
                                className="flex-1 bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-[var(--gta-green)] font-sans"
                            />
                            <button onClick={() => sendMessage()} className="bg-[var(--gta-green)] text-black p-3 rounded-xl hover:bg-emerald-500 transition-all">
                                <Send size={20}/>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                    <MessageSquare size={48} className="mb-4 opacity-50"/>
                    <p className="text-xl font-bold uppercase">Select a chat room</p>
                </div>
            )}
        </div>
    </div>
  );
};
export default AdminChats;