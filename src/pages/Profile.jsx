import React, { useState, useEffect } from 'react';
import { MessageSquare, Package, Copy, Check, Ticket, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import apiClient from '../api/client';
import { formatLKR } from '../utils/currency';
import io from 'socket.io-client';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const socket = io.connect("https://dark-console-backend.onrender.com");

// Chat Component (For Services Only)
const UserChatWindow = ({ order, onClose, username }) => {
    const [msg, setMsg] = useState("");
    const [list, setList] = useState([]);
    
    useEffect(() => {
        socket.emit("join_room", order.chatRoomId);
        // Load history logic should be here ideally
        socket.on("receive_message", (data) => setList((l) => [...l, data]));
        return () => socket.off("receive_message");
    }, [order]);

    const send = async () => {
        if(msg !== "") {
            const data = { room: order.chatRoomId, author: username, message: msg, time: new Date().toLocaleTimeString(), type: 'user' };
            await socket.emit("send_message", data);
            // setList((l) => [...l, data]); // Socket will echo back
            setMsg("");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md h-[500px] flex flex-col rounded-xl border border-zinc-700">
                <div className="p-4 border-b border-zinc-700 flex justify-between">
                    <h3 className="text-white font-bold">Service Support #{order._id.slice(-4)}</h3>
                    <button onClick={onClose} className="text-zinc-400">X</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {list.map((m,i) => (
                        <div key={i} className={`flex flex-col ${m.type === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className={`px-3 py-2 rounded-lg text-sm ${m.type === 'user' ? 'bg-[var(--gta-green)] text-black' : 'bg-zinc-800 text-white'}`}>{m.message}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-700 flex gap-2">
                    <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 bg-black p-2 text-white rounded" placeholder="Type..." />
                    <button onClick={send} className="bg-[var(--gta-green)] px-4 rounded text-black font-bold">Send</button>
                </div>
            </div>
        </div>
    );
};

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
            <div className="flex items-center gap-4 mb-8">
                <img src={user.photoURL} className="w-16 h-16 rounded-full border-2 border-[var(--gta-green)]"/>
                <div>
                    <h1 className="text-3xl font-black uppercase text-white">{user.displayName}</h1>
                    <p className="text-zinc-500 text-sm">{user.email}</p>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Order History</h2>

            <div className="grid gap-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-[var(--gta-green)]">
                                {order.orderType === 'event' ? <Ticket /> : <Package />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">{order.packageDetails.title}</h3>
                                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-1">
                                    <span>Order ID: #{order._id.slice(-6)}</span>
                                    <span className="uppercase border border-zinc-700 px-1 rounded bg-black">{order.orderType}</span>
                                </div>
                                <p className="text-[var(--gta-green)] font-mono font-bold mt-1">{formatLKR(order.packageDetails.price)}</p>
                            </div>
                        </div>

                        {/* Crew Code Display */}
                        {order.orderType === 'event' && order.crewCode && (order.status === 'pool' || order.status === 'completed') && (
                            <div className="bg-black/40 border border-[var(--gta-green)]/30 p-3 rounded-lg flex flex-col items-center">
                                <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Crew Invite Code</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-white font-mono text-xl font-bold tracking-widest">{order.crewCode}</code>
                                    <button onClick={() => handleCopy(order.crewCode)} className="text-zinc-500 hover:text-white">
                                        {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                                order.status === 'completed' || order.status === 'pool' ? 'bg-green-900/30 text-green-500 border-green-900' :
                                order.status === 'in_progress' ? 'bg-blue-900/30 text-blue-500 border-blue-900' :
                                order.status === 'cancelled' ? 'bg-red-900/30 text-red-500 border-red-900' :
                                'bg-yellow-900/30 text-yellow-500 border-yellow-900'
                            }`}>
                                {order.status === 'in_progress' ? 'Processing' : 
                                 order.status === 'pool' ? 'Approved' : 
                                 order.status}
                            </span>

                            {/* LOGIC UPDATE: Only show Chat button for NON-EVENT orders */}
                            {order.orderType !== 'event' && (order.status === 'in_progress' || order.status === 'pool') && (
                                <button onClick={() => setChatOrder(order)} className="bg-white hover:bg-[var(--gta-green)] text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <MessageSquare size={16}/> Chat
                                </button>
                            )}

                            {/* For Events, show a link to Events page */}
                            {order.orderType === 'event' && (order.status === 'pool' || order.status === 'completed') && (
                                <button onClick={() => navigate('/events')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <ExternalLink size={16}/> Go to Event
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {!loading && orders.length === 0 && <p className="text-zinc-500 text-center py-10">No orders found.</p>}
            </div>
        </div>
        {chatOrder && <UserChatWindow order={chatOrder} onClose={()=>setChatOrder(null)} username={user.displayName} />}
    </div>
  );
};
export default Profile;