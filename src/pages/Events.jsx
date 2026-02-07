import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Clock, Lock, MessageCircle, CheckCircle, Upload, X, Trophy, CreditCard, Banknote, Image as ImageIcon, Headset, Reply, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import apiClient from '../api/client';
import { formatLKR } from '../utils/currency';
import { auth } from '../firebase';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io.connect("https://api.dark-console.com");

// --- COUNTDOWN COMPONENT ---
const Countdown = ({ targetDate, targetTime }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const calculateTime = () => {
            const eventDate = new Date(`${targetDate}T${targetTime}`);
            const now = new Date();
            const diff = eventDate - now;

            if (diff <= 0) return null;

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        };

        const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    if (!timeLeft) return <div className="text-red-500 font-bold tracking-widest bg-red-900/20 px-3 py-1 rounded text-xs md:text-sm border border-red-500/50 animate-pulse">EVENT LIVE NOW</div>;

    return (
        <div className="flex gap-2 md:gap-4 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-2 md:p-3 min-w-[50px] md:min-w-[70px] shadow-xl">
                    <div className="text-xl md:text-3xl font-black text-[var(--gta-green)] leading-none mb-1 font-sans">{value}</div>
                    <div className="text-[8px] md:text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{unit}</div>
                </div>
            ))}
        </div>
    );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [activeChatEvent, setActiveChatEvent] = useState(null);
  const navigate = useNavigate();

  // Checkout Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participantName, setParticipantName] = useState(""); 
  const [contact, setContact] = useState("");
  const [slipImage, setSlipImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat States
  const [chatMode, setChatMode] = useState('global'); 
  const [chatMsg, setChatMsg] = useState("");
  const [chatList, setChatList] = useState([]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    apiClient.get('/events').then(res => setEvents(res.data));
    auth.onAuthStateChanged(async (u) => {
        setUser(u);
        if(u) {
            setParticipantName(u.displayName || ""); 
            try {
                const { data } = await apiClient.get(`/orders/myorders?uid=${u.uid}`);
                setMyOrders(data);
            } catch (err) { console.error("Error fetching orders"); }
        }
    });
  }, []);

  // Check Participation
  const hasJoined = (event) => {
      if(!user) return false;
      // 1. Leader (Has Order)
      const hasOrder = myOrders.some(o => 
          o.packageDetails.eventId === event._id && 
          ['pool', 'completed', 'in_progress'].includes(o.status)
      );
      if(hasOrder) return true;

      // 2. Member (In Crew)
      if(event.crews) {
          return event.crews.some(crew => crew.members.some(m => m.userId === user.uid));
      }
      return false;
  };

  // Check if User is the Leader (Who Paid) - For Admin Support Access
  const isEventLeader = (eventId) => {
      return myOrders.some(o => o.packageDetails.eventId === eventId);
  };

  // --- ORDER & PAYMENT LOGIC (Keep as is) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrder = async () => {
      if(!participantName || !contact || !slipImage) return alert("Please fill details!");
      setIsSubmitting(true);
      const orderData = {
          userId: user.uid,
          customer: { name: user.displayName, contact: contact },
          packageDetails: {
              title: selectedEvent.title,
              price: selectedEvent.price,
              platform: 'Event',
              version: selectedEvent.mode === 'crew' ? 'Crew' : 'Individual',
              eventId: selectedEvent._id,
              mode: selectedEvent.mode
          },
          paymentSlip: slipImage,
          orderType: 'event',
          crewName: selectedEvent.mode === 'crew' ? participantName : null
      };

      try {
          await apiClient.post('/orders', orderData);
          alert("Request Sent! Redirecting...");
          navigate('/profile');
      } catch (err) {
          alert("Failed to join.");
      } finally {
          setIsSubmitting(false);
          setSelectedEvent(null);
      }
  };

  const handleJoinWithCode = async (eventId) => {
      if(!user) return alert("Login First!");
      try {
          await apiClient.post('/events/join-crew', {
              eventId,
              crewCode: joinCode.trim(), 
              userId: user.uid,
              userName: user.displayName
          });
          alert("Joined Crew Successfully!");
          setJoinCode("");
          window.location.reload();
      } catch (err) {
          alert(err.response?.data?.message || "Invalid Code");
      }
  };

  // --- UPDATED CHAT LOGIC (FIXED FOR ADMIN PANEL) ---

  const getRoomId = (event, mode) => {
      if (mode === 'global') return `event_${event._id}`;
      
      // 🔥 FIX: For Admin Support, find the ORDER ID associated with this event
      if (mode === 'support') {
          const order = myOrders.find(o => o.packageDetails.eventId === event._id);
          // If order exists, use its chatRoomId (or fallback to generated one)
          if (order) return order.chatRoomId || `chat_${order._id}`;
      }
      return null;
  };

  const openChat = (event) => {
      setActiveChatEvent(event);
      setChatMode('global'); 
      loadChatRoom(event, 'global');
  };

  const switchChatMode = (mode) => {
      setChatMode(mode);
      loadChatRoom(activeChatEvent, mode);
  };

  const loadChatRoom = async (event, mode) => {
      const roomId = getRoomId(event, mode);
      if(!roomId) return; // Should not happen for leader

      setChatList([]); 
      socket.emit("join_room", roomId);
      
      try {
          const { data } = await apiClient.get(`/chats/${roomId}`);
          setChatList(data);
          scrollToBottom();
      } catch (err) { console.log("New room"); }
  };

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleChatImage = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => sendMessage(null, reader.result);
          reader.readAsDataURL(file);
      }
  };

  const sendMessage = (e, imgData = null) => {
      if(e) e.preventDefault();
      if (!chatMsg.trim() && !imgData) return;

      const roomId = getRoomId(activeChatEvent, chatMode);
      
      const data = { 
          room: roomId, 
          author: user.displayName, 
          message: imgData ? "Sent an image" : chatMsg, 
          type: imgData ? 'image' : 'text',
          attachment: imgData,
          createdAt: new Date().toISOString()
      };

      socket.emit("send_message", data);
      setChatMsg("");
  };

  useEffect(() => {
      const handleMessage = (data) => {
          if (activeChatEvent) {
              const currentRoom = getRoomId(activeChatEvent, chatMode);
              if (data.room === currentRoom) {
                  setChatList((list) => [...list, data]);
                  scrollToBottom();
              }
          }
      };
      socket.on("receive_message", handleMessage);
      return () => { socket.off("receive_message", handleMessage); };
  }, [activeChatEvent, chatMode]);

  return (
    <div className="bg-[#09090b] min-h-screen text-white pt-24 pb-20 font-sans">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-12 text-center tracking-tight font-sans">Tournament <span className="text-[var(--gta-green)]">Hub</span></h1>

          <div className="space-y-16">
              {events.map(event => {
                  const isJoined = hasJoined(event);
                  const isLeader = isEventLeader(event._id); // Check if user is the payer

                  return (
                    <div key={event._id} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col lg:flex-row relative shadow-2xl hover:border-zinc-700 transition-all font-sans">
                        
                        {isJoined && (
                            <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 z-20 backdrop-blur-md font-sans">
                                <CheckCircle size={14}/> Registered
                            </div>
                        )}

                        <div className="lg:w-7/12 h-[300px] lg:h-auto relative overflow-hidden">
                            <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                <div className="mb-4 md:mb-6">
                                    <Countdown targetDate={event.date} targetTime={event.time} />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase text-white leading-none mb-4 drop-shadow-lg font-sans">{event.title}</h2>
                                <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm font-bold text-white/90 font-sans">
                                    <span className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10"><Calendar size={14} className="text-[var(--gta-green)]"/> {event.date}</span>
                                    <span className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10"><Clock size={14} className="text-[var(--gta-green)]"/> {event.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-5/12 p-6 md:p-10 flex flex-col bg-zinc-900">
                            
                            {/* --- CHAT INTERFACE --- */}
                            {activeChatEvent?._id === event._id ? (
                                <div className="flex-1 flex flex-col bg-black rounded-2xl border border-zinc-800 overflow-hidden h-[500px]">
                                    
                                    <div className="flex border-b border-zinc-800 bg-zinc-900">
                                        <button 
                                            onClick={() => switchChatMode('global')}
                                            className={`flex-1 py-4 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${chatMode === 'global' ? 'bg-black text-[var(--gta-green)] border-b-2 border-[var(--gta-green)]' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            <Users size={14}/> Global
                                        </button>
                                        
                                        {/* Show Admin Support ONLY to Leader */}
                                        {isLeader && (
                                            <button 
                                                onClick={() => switchChatMode('support')}
                                                className={`flex-1 py-4 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${chatMode === 'support' ? 'bg-black text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-white'}`}
                                            >
                                                <Headset size={14}/> Admin Support
                                            </button>
                                        )}
                                        
                                        <button onClick={() => setActiveChatEvent(null)} className="px-4 text-zinc-500 hover:text-red-500"><X size={16}/></button>
                                    </div>

                                    <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-[#0a0a0a]">
                                        {chatList.length === 0 && (
                                            <div className="text-center text-zinc-600 text-xs mt-10">
                                                {chatMode === 'global' ? "Say hello to everyone!" : "Contact Admin for issues."}
                                            </div>
                                        )}
                                        {chatList.map((m,i) => {
                                            const isMe = m.author === user?.displayName;
                                            return (
                                                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl p-3 relative group ${isMe ? 'bg-[var(--gta-green)] text-black rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none'}`}>
                                                        {m.type === 'image' ? (
                                                            <img src={m.attachment} className="w-full rounded-lg max-h-48 object-cover cursor-pointer" onClick={()=>window.open(m.attachment)}/>
                                                        ) : (
                                                            <p className="text-sm font-sans">{m.message}</p>
                                                        )}
                                                        <span className={`text-[9px] font-bold block mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                            {m.author}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="p-3 border-t border-zinc-800 bg-zinc-900">
                                        <div className="flex gap-2 items-end">
                                            <button onClick={() => fileInputRef.current.click()} className="bg-zinc-800 p-3 rounded-xl text-zinc-400 hover:text-white transition-all">
                                                <ImageIcon size={18}/>
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleChatImage} />
                                            
                                            <input 
                                                value={chatMsg} 
                                                onChange={e=>setChatMsg(e.target.value)} 
                                                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                                className="bg-black flex-1 p-3 rounded-xl text-sm text-white border border-zinc-800 outline-none focus:border-[var(--gta-green)] font-sans" 
                                                placeholder={chatMode === 'global' ? "Message everyone..." : "Message admin..."} 
                                            />
                                            <button onClick={() => sendMessage()} className={`text-black p-3 rounded-xl hover:opacity-80 font-bold ${chatMode === 'global' ? 'bg-[var(--gta-green)]' : 'bg-blue-500'}`}>
                                                <MessageCircle size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Default View (Details)
                                <div className="flex-1 space-y-6 md:space-y-8">
                                    <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-[var(--gta-green)] pl-4 font-sans">{event.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black p-4 rounded-2xl border border-zinc-800">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1 font-sans">Entry Fee</p>
                                            <p className="text-xl md:text-2xl font-black text-[var(--gta-green)] font-sans truncate" title={formatLKR(event.price)}>
                                                {event.price === 0 ? 'FREE' : formatLKR(event.price)}
                                            </p>
                                        </div>
                                        <div className="bg-black p-4 rounded-2xl border border-zinc-800">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1 font-sans">Mode</p>
                                            <p className="text-white font-bold uppercase flex items-center gap-2 font-sans"><Users size={18}/> {event.mode}</p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-900/10 p-4 rounded-2xl border border-yellow-900/20">
                                        <div className="flex items-center gap-2 mb-3 text-yellow-500 font-bold uppercase text-xs font-sans">
                                            <Trophy size={16}/> Prize Pool
                                        </div>
                                        <div className="flex justify-between text-xs md:text-sm font-sans flex-wrap gap-2">
                                            <div className="text-center flex-1 min-w-[60px]"><div className="text-white font-bold">{event.prizes.first}</div><div className="text-[10px] text-zinc-500 uppercase">1st</div></div>
                                            <div className="w-[1px] bg-white/10"></div>
                                            <div className="text-center flex-1 min-w-[60px]"><div className="text-white font-bold">{event.prizes.second}</div><div className="text-[10px] text-zinc-500 uppercase">2nd</div></div>
                                            <div className="w-[1px] bg-white/10"></div>
                                            <div className="text-center flex-1 min-w-[60px]"><div className="text-white font-bold">{event.prizes.third}</div><div className="text-[10px] text-zinc-500 uppercase">3rd</div></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col gap-3">
                                {isJoined ? (
                                    <button onClick={() => openChat(event)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-all font-sans">
                                        <MessageCircle size={18}/> Open Event & Support Chat
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            if(!user) return alert("Login First");
                                            setSelectedEvent(event);
                                        }}
                                        className="w-full bg-[var(--gta-green)] hover:bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-sm shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] font-sans"
                                    >
                                        {event.price === 0 ? 'Register Now' : `Pay & Join (${formatLKR(event.price)})`}
                                    </button>
                                )}

                                {!isJoined && event.mode === 'crew' && (
                                    <div className="flex gap-2 mt-2">
                                        <input type="text" placeholder="Have a Code?" value={joinCode} onChange={e=>setJoinCode(e.target.value)} className="bg-black border border-zinc-800 p-3 rounded-xl text-white text-xs w-full uppercase outline-none focus:border-zinc-600 font-sans"/>
                                        <button onClick={() => handleJoinWithCode(event._id)} className="bg-white text-black px-6 rounded-xl font-bold text-xs uppercase hover:bg-zinc-200 font-sans">Join</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* --- CHECKOUT MODAL (Keep as is - from previous step) --- */}
      {selectedEvent && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-3xl p-6 md:p-8 relative shadow-2xl animate-fade-in font-sans my-auto">
                  <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X/></button>
                  
                  <h2 className="text-xl md:text-2xl font-black uppercase text-white mb-6 flex items-center gap-2">
                      <Lock className="text-[var(--gta-green)]"/> Secure Registration
                  </h2>

                  <div className="space-y-5">
                      <div>
                          <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">
                              {selectedEvent.mode === 'crew' ? 'Create Crew Name' : 'Player Name'}
                          </label>
                          <input type="text" value={participantName} onChange={e => setParticipantName(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-[var(--gta-green)] transition-all font-sans"/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">WhatsApp Number</label>
                          <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-[var(--gta-green)] transition-all font-sans" />
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 space-y-4">
                          <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2 flex items-center gap-2 border-b border-zinc-800 pb-1"><CreditCard size={12}/> Local Bank Transfer</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  <div className="flex justify-between md:block"><span className="text-zinc-500">Bank:</span> <span className="text-white font-bold">Sapmath bank</span></div>
                                  <div className="flex justify-between md:block"><span className="text-zinc-500">Branch:</span> <span className="text-white font-bold">Karagampitiya</span></div>
                                  <div className="flex justify-between md:block"><span className="text-zinc-500">Name:</span> <span className="text-white font-bold">H.W.W. Chathuranga</span></div>
                                  <div className="flex justify-between md:block"><span className="text-zinc-500">Acc No:</span> <span className="text-[var(--gta-green)] font-mono font-bold text-sm">121052472400</span></div>
                              </div>
                          </div>
                          <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2 flex items-center gap-2 border-b border-zinc-800 pb-1"><Banknote size={12}/> Crypto Payment</p>
                              <div className="space-y-2 text-xs">
                                  <div className="flex justify-between items-center"><span className="text-zinc-500">Binance Pay ID:</span><span className="text-[var(--gta-green)] font-mono font-bold text-sm">577115246</span></div>
                                  <div><span className="text-zinc-500 block mb-1">USDT (TRC20):</span><div className="bg-black p-2 rounded text-zinc-400 font-mono break-all border border-zinc-800 text-[10px]">TDhVpGzM6s6u8T4osAUR9Yqh14o5Hgoj8u</div></div>
                              </div>
                          </div>
                      </div>
                      <label className={`block w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${slipImage ? 'border-[var(--gta-green)] bg-green-900/10' : 'border-zinc-700 hover:border-zinc-500'}`}>
                          <Upload className={`mx-auto mb-2 ${slipImage ? 'text-[var(--gta-green)]' : 'text-zinc-500'}`} />
                          <span className="text-xs font-bold uppercase text-zinc-400 font-sans">{slipImage ? "Slip Attached" : "Upload Payment Slip"}</span>
                          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                      <button onClick={handleConfirmOrder} disabled={isSubmitting} className="w-full bg-[var(--gta-green)] hover:bg-emerald-500 text-black font-black uppercase py-4 rounded-xl transition-all mt-2 shadow-lg shadow-green-900/20 font-sans">{isSubmitting ? "Processing..." : `Confirm Payment (${formatLKR(selectedEvent.price)})`}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default Events;