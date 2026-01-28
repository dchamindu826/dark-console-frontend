import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Archive, Send, X, User, Image, Reply } from 'lucide-react';
import apiClient from '../../api/client';
import { formatLKR } from '../../utils/currency';
import io from 'socket.io-client';

// --- CHAT WINDOW COMPONENT (ADMIN SIDE) ---
const socket = io.connect("https://api.dark-console.com");

const AdminChatWindow = ({ order, onClose }) => {
    const [msg, setMsg] = useState("");
    const [image, setImage] = useState(null); // 🔥 Image State
    const [replyTo, setReplyTo] = useState(null); // 🔥 Reply State
    const [list, setList] = useState([]);
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    const scrollRef = useRef(null);

    useEffect(() => {
        socket.emit("join_room", order.chatRoomId);
        // Load messages (Real-time)
        socket.on("receive_message", (data) => {
            setList((l) => [...l, data]);
            scrollToBottom();
        });
        return () => socket.off("receive_message");
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
        if (msg !== "" || image) {
            const data = { 
                room: order.chatRoomId, 
                author: adminInfo.username, 
                message: msg, 
                image: image, // 🔥 Send Image
                replyTo: replyTo, // 🔥 Send Reply Context
                time: new Date().toLocaleTimeString(), 
                type: 'admin' 
            };
            await socket.emit("send_message", data);
            
            // Note: We don't manually setList here because the socket will echo it back via 'receive_message'
            setMsg("");
            setImage(null);
            setReplyTo(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md h-[600px] flex flex-col rounded-2xl border border-zinc-700 shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800 rounded-t-2xl">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <User size={16} className="text-[var(--gta-green)]"/> {order.customer.name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{order.packageDetails.title}</p>
                    </div>
                    <button onClick={onClose} className="bg-black/50 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-red-500/20 transition-all"><X size={18}/></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20 custom-scrollbar">
                    {list.length === 0 && <p className="text-center text-zinc-600 text-xs italic mt-10">Start the conversation...</p>}
                    {list.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.type === 'admin' ? 'items-end' : 'items-start'} group`}>
                            
                            {/* Reply Action Button (Show on Hover) */}
                            <div className={`flex items-end gap-2 ${m.type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm relative ${
                                    m.type === 'admin' 
                                    ? 'bg-[var(--gta-green)] text-black font-medium rounded-tr-none' 
                                    : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700'
                                }`}>
                                    {/* Render Reply Context */}
                                    {m.replyTo && (
                                        <div className={`mb-2 p-2 rounded text-xs border-l-2 ${m.type === 'admin' ? 'bg-black/10 border-black' : 'bg-black/30 border-[var(--gta-green)]'}`}>
                                            <p className="font-bold opacity-70">{m.replyTo.author}</p>
                                            <p className="truncate opacity-70">{m.replyTo.image ? '📷 [Image]' : m.replyTo.message}</p>
                                        </div>
                                    )}

                                    {/* Render Image */}
                                    {m.image && (
                                        <img src={m.image} alt="Sent" className="rounded-lg mb-1 max-w-full max-h-48 object-cover"/>
                                    )}

                                    {/* Render Text */}
                                    {m.message && <p>{m.message}</p>}
                                </div>

                                {/* Reply Button */}
                                <button onClick={() => setReplyTo(m)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity">
                                    <Reply size={14}/>
                                </button>
                            </div>
                            
                            <span className="text-[10px] text-zinc-600 mt-1 px-1">{m.time}</span>
                        </div>
                    ))}
                    <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-800 rounded-b-2xl">
                    
                    {/* Reply Preview Banner */}
                    {replyTo && (
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg mb-2 border-l-2 border-[var(--gta-green)]">
                            <div className="text-xs text-zinc-300">
                                <span className="font-bold text-[var(--gta-green)]">Replying to {replyTo.author}:</span>
                                <p className="truncate max-w-[200px]">{replyTo.image ? '📷 [Image]' : replyTo.message}</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                        </div>
                    )}

                    {/* Image Preview Banner */}
                    {image && (
                        <div className="relative w-16 h-16 mb-2">
                            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg border border-zinc-600"/>
                            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {/* Image Upload Button */}
                        <label className="bg-zinc-700 hover:bg-zinc-600 p-3 rounded-xl cursor-pointer transition-colors text-white flex items-center justify-center">
                            <Image size={20}/>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <input 
                            value={msg} 
                            onChange={e=>setMsg(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && send()}
                            className="flex-1 bg-black border border-zinc-600 p-3 rounded-xl text-white text-sm focus:border-[var(--gta-green)] outline-none transition-colors" 
                            placeholder={image ? "Add a caption..." : "Type your message..."}
                        />
                        <button onClick={send} className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black p-3 rounded-xl transition-colors">
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
        const { data } = await apiClient.get('/orders');
        setJobs(data);
    } catch (error) {
        console.error("Error fetching jobs", error);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
      let reason = "";
      if(status === 'cancelled') {
          reason = prompt("Please enter the reason for cancellation:");
          if(!reason) return; 
      }
      
      if(window.confirm(`Mark this job as ${status}? This cannot be undone.`)) {
          try {
              await apiClient.put(`/orders/${id}/status`, { status, reason });
              fetchJobs(); 
          } catch (error) {
              alert("Update Failed");
          }
      }
  };

  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'cancelled');

  return (
    <div className="p-6">
       {/* 1. STATS BAR */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
               <div>
                   <p className="text-zinc-500 text-xs font-bold uppercase">Active Assignments</p>
                   <h3 className="text-3xl font-black text-white mt-1">{activeJobs.length}</h3>
               </div>
               <div className="w-12 h-12 rounded-full bg-blue-900/30 text-blue-500 flex items-center justify-center"><Clock/></div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
               <div>
                   <p className="text-zinc-500 text-xs font-bold uppercase">Jobs Completed</p>
                   <h3 className="text-3xl font-black text-white mt-1">{jobs.filter(j => j.status === 'completed').length}</h3>
               </div>
               <div className="w-12 h-12 rounded-full bg-emerald-900/30 text-emerald-500 flex items-center justify-center"><CheckCircle/></div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
               <div>
                   <p className="text-zinc-500 text-xs font-bold uppercase">Cancelled</p>
                   <h3 className="text-3xl font-black text-white mt-1">{jobs.filter(j => j.status === 'cancelled').length}</h3>
               </div>
               <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-500 flex items-center justify-center"><XCircle/></div>
           </div>
       </div>

       {/* 2. TABS */}
       <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-1">
           <button 
               onClick={() => setViewMode('active')}
               className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode === 'active' ? 'text-[var(--gta-green)] border-[var(--gta-green)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
           >
               Active Queue ({activeJobs.length})
           </button>
           <button 
               onClick={() => setViewMode('history')}
               className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode === 'history' ? 'text-[var(--gta-green)] border-[var(--gta-green)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
           >
               History ({completedJobs.length})
           </button>
       </div>

       {/* 3. JOB LIST */}
       <div className="space-y-4">
           {loading && <p className="text-zinc-500">Loading jobs...</p>}
           
           {(viewMode === 'active' ? activeJobs : completedJobs).map(job => (
               <div key={job._id} className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-zinc-500 transition-colors">
                   
                   {/* Job Info */}
                   <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white">{job.packageDetails.title}</h3>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                               job.status === 'in_progress' ? 'bg-blue-900/20 text-blue-400 border-blue-900' :
                               job.status === 'completed' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900' :
                               'bg-red-900/20 text-red-400 border-red-900'
                           }`}>
                               {job.status === 'in_progress' ? 'Ongoing' : job.status}
                           </span>
                       </div>
                       <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                           <p><span className="text-zinc-600 uppercase font-bold text-xs">Customer:</span> {job.customer.name}</p>
                           <p><span className="text-zinc-600 uppercase font-bold text-xs">Contact:</span> {job.customer.contact}</p>
                           <p><span className="text-zinc-600 uppercase font-bold text-xs">Price:</span> <span className="text-[var(--gta-green)] font-mono">{formatLKR(job.packageDetails.price)}</span></p>
                       </div>
                       {job.status === 'cancelled' && (
                           <p className="mt-2 text-xs text-red-500 bg-red-900/10 p-2 rounded border border-red-900/30">Reason: {job.cancellationReason}</p>
                       )}
                   </div>

                   {/* Actions (Only for Active Jobs) */}
                   {viewMode === 'active' && (
                       <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                           <button 
                               onClick={() => setActiveChat(job)}
                               className="bg-white hover:bg-zinc-200 text-black font-black uppercase px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
                           >
                               <MessageSquare size={18}/> Open Chat
                           </button>
                           <button 
                               onClick={() => handleUpdateStatus(job._id, 'completed')}
                               className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black font-black uppercase px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
                           >
                               <CheckCircle size={18}/> Complete
                           </button>
                           <button 
                               onClick={() => handleUpdateStatus(job._id, 'cancelled')}
                               className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black uppercase px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm border border-red-500/50 transition-all"
                           >
                               <XCircle size={18}/> Cancel
                           </button>
                       </div>
                   )}

                   {/* History View Actions */}
                   {viewMode === 'history' && (
                       <button disabled className="text-zinc-600 font-bold uppercase text-xs flex items-center gap-2 border border-zinc-800 px-4 py-2 rounded cursor-not-allowed">
                           <Archive size={14}/> Archived
                       </button>
                   )}
               </div>
           ))}

           {(viewMode === 'active' ? activeJobs : completedJobs).length === 0 && (
               <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                   <p className="text-zinc-500">No {viewMode} jobs found.</p>
               </div>
           )}
       </div>

       {/* CHAT MODAL */}
       {activeChat && <AdminChatWindow order={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  );
};

export default MyJobs;