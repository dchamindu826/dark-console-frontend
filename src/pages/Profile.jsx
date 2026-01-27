import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Package, Copy, Check, Ticket, ExternalLink, Send, X, Image, Reply, Clock } from 'lucide-react';
import Header from '../components/Header';
import apiClient from '../api/client';
import { formatLKR } from '../utils/currency';
import io from 'socket.io-client';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const socket = io.connect("https://dark-console-backend.onrender.com");

// --- USER CHAT COMPONENT (WITH IMAGE & REPLY) ---
const UserChatWindow = ({ order, onClose, username }) => {
    const [msg, setMsg] = useState("");
    const [image, setImage] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [list, setList] = useState([]);
    const scrollRef = useRef(null);
    
    useEffect(() => {
        socket.emit("join_room", order.chatRoomId);
        
        // Listen for incoming messages
        const handleReceiveMessage = (data) => {
            setList((prev) => [...prev, data]);
            scrollToBottom();
        };

        socket.on("receive_message", handleReceiveMessage);

        // Load existing messages
        apiClient.get(`/orders/${order._id}/messages`)
            .then(res => {
                setList(res.data);
                scrollToBottom();
            })
            .catch(err => console.error(err));

        return () => socket.off("receive_message", handleReceiveMessage);
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

    const send = async () => {
        if(msg !== "" || image) {
            const data = { 
                orderId: order._id, // Save to DB requirement
                room: order.chatRoomId, 
                senderId: auth.currentUser.uid,
                senderName: username, 
                message: msg, 
                image: image, 
                replyTo: replyTo, 
                isAdmin: false // This is user
            };

            // Send via Socket
            await socket.emit("send_message", data);
            
            // Note: Socket echos back via 'receive_message', so we don't manually add to list
            setMsg("");
            setImage(null);
            setReplyTo(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md h-[600px] flex flex-col rounded-xl border border-zinc-700 shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800 rounded-t-xl">
                    <h3 className="text-white font-bold flex flex-col">
                        <span>Support Chat</span>
                        <span className="text-[10px] text-[var(--gta-green)] font-normal">Order #{order._id.slice(-4)}</span>
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20}/></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/30 custom-scrollbar">
                    {list.map((m,i) => {
                        const isMe = !m.isAdmin; // If isAdmin is false, it's the user (me)
                        return (
                            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] relative ${
                                        isMe 
                                        ? 'bg-[var(--gta-green)] text-black font-medium rounded-tr-none' 
                                        : 'bg-zinc-800 text-white border border-zinc-700 rounded-tl-none'
                                    }`}>
                                        {/* Reply Context */}
                                        {m.replyTo && (
                                            <div className={`mb-1 p-1 rounded text-xs border-l-2 ${isMe ? 'bg-black/10 border-black' : 'bg-black/30 border-[var(--gta-green)]'}`}>
                                                <p className="font-bold opacity-70">{m.replyTo.senderName || m.replyTo.author}</p>
                                                <p className="truncate opacity-70 max-w-[150px]">{m.replyTo.image ? '📷 [Image]' : m.replyTo.message}</p>
                                            </div>
                                        )}

                                        {/* Image */}
                                        {m.image && (
                                            <img src={m.image} alt="Sent" className="rounded-lg mb-1 max-w-full max-h-48 object-cover"/>
                                        )}

                                        {/* Text */}
                                        {m.message && <span>{m.message}</span>}
                                    </div>

                                    {/* Reply Button */}
                                    <button onClick={() => setReplyTo(m)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity">
                                        <Reply size={14}/>
                                    </button>
                                </div>
                                <span className="text-[9px] text-zinc-600 mt-0.5 px-1">
                                    {m.senderName} • {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        );
                    })}
                    <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-800 rounded-b-xl">
                    {/* Reply Preview */}
                    {replyTo && (
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded mb-2 border-l-2 border-[var(--gta-green)]">
                            <div className="text-xs text-zinc-300">
                                <span className="font-bold text-[var(--gta-green)]">Replying to {replyTo.senderName || replyTo.author}</span>
                                <p className="truncate max-w-[200px]">{replyTo.image ? '📷 [Image]' : replyTo.message}</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                        </div>
                    )}

                    {/* Image Preview */}
                    {image && (
                        <div className="relative w-16 h-16 mb-2">
                            <img src={image} alt="Preview" className="w-full h-full object-cover rounded border border-zinc-600"/>
                            <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <label className="bg-zinc-700 hover:bg-zinc-600 p-2 rounded-lg cursor-pointer text-white flex items-center justify-center transition-colors">
                            <Image size={20}/>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <input 
                            value={msg} 
                            onChange={e=>setMsg(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && send()}
                            className="flex-1 bg-black p-2 text-white rounded-lg border border-zinc-600 focus:border-[var(--gta-green)] outline-none transition-all" 
                            placeholder={image ? "Add caption..." : "Type a message..."} 
                        />
                        <button onClick={send} className="bg-[var(--gta-green)] px-4 rounded-lg text-black font-bold hover:bg-emerald-500 transition-colors">
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PROFILE PAGE ---
const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (u) => {
          if (u) {
              setUser(u);
              try {
                  // 🔥 Ensure backend route /api/orders/myorders exists
                  const { data } = await apiClient.get(`/orders/myorders?uid=${u.uid}`); 
                  setOrders(data);
              } catch (error) {
                  console.error("Fetch Error", error);
              } finally {
                  setLoading(false);
              }
          } else {
              setLoading(false);
          }
      });
      return () => unsubscribe();
  }, []);

  const handleCopy = (code) => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="bg-[#09090b] min-h-screen text-white pt-32 text-center">Loading Profile...</div>;
  if (!user) return <div className="bg-[#09090b] min-h-screen text-white pt-32 text-center">Please Login to view Profile.</div>;

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20 px-4">
        <Header />
        <div className="max-w-5xl mx-auto">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <img src={user.photoURL} className="w-16 h-16 rounded-full border-2 border-[var(--gta-green)]"/>
                <div>
                    <h1 className="text-3xl font-black uppercase text-white">{user.displayName}</h1>
                    <p className="text-zinc-500 text-sm">{user.email}</p>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Package className="text-[var(--gta-green)]"/> Order History
            </h2>

            <div className="grid gap-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-zinc-700 transition-colors">
                        
                        {/* Order Details */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[var(--gta-green)] border border-zinc-800">
                                {order.orderType === 'event' ? <Ticket /> : <Package />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">{order.packageDetails.title}</h3>
                                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-1">
                                    <span>#{order._id.slice(-6)}</span>
                                    <span className="uppercase bg-black px-2 py-0.5 rounded border border-zinc-800">{order.orderType}</span>
                                    <span className="text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[var(--gta-green)] font-mono font-bold mt-1">{formatLKR(order.packageDetails.price)}</p>
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
                            
                            {/* Status Badge */}
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                order.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                order.status === 'pool' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : // Approved by Admin
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-orange-500/10 text-orange-400 border-orange-500/20' // Pending
                            }`}>
                                {order.status === 'pending' && <span className="flex items-center gap-1"><Clock size={12}/> Pending Approval</span>}
                                {order.status === 'pool' && 'Approved (Waiting)'}
                                {order.status === 'in_progress' && 'Agent Assigned'}
                                {order.status === 'completed' && 'Completed'}
                                {order.status === 'cancelled' && 'Cancelled'}
                            </span>

                            {/* Crew Code (If Event & Approved) */}
                            {order.orderType === 'event' && order.crewCode && (order.status === 'pool' || order.status === 'completed') && (
                                <button onClick={() => handleCopy(order.crewCode)} className="flex items-center gap-2 bg-black border border-zinc-700 px-3 py-1.5 rounded-lg hover:border-[var(--gta-green)] transition-colors group">
                                    <span className="text-zinc-400 text-xs">Code:</span>
                                    <code className="text-white font-mono font-bold">{order.crewCode}</code>
                                    {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-zinc-500 group-hover:text-white"/>}
                                </button>
                            )}

                            {/* 🔥 CHAT BUTTON: ONLY when In Progress (Assigned) */}
                            {order.orderType !== 'event' && order.status === 'in_progress' && (
                                <button onClick={() => setChatOrder(order)} className="bg-white hover:bg-[var(--gta-green)] text-black px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-white/5">
                                    <MessageSquare size={16}/> Chat with Agent
                                </button>
                            )}

                             {/* Event Link */}
                             {order.orderType === 'event' && (order.status === 'pool' || order.status === 'completed') && (
                                <button onClick={() => navigate('/events')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <ExternalLink size={16}/> Event Page
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {!loading && orders.length === 0 && (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                        <Package size={48} className="mx-auto text-zinc-700 mb-4"/>
                        <p className="text-zinc-500">You haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/services')} className="mt-4 text-[var(--gta-green)] hover:underline">Browse Store</button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Chat Window Popup */}
        {chatOrder && <UserChatWindow order={chatOrder} onClose={()=>setChatOrder(null)} username={user.displayName} />}
    </div>
  );
};

export default Profile;