import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../api/client';
import { formatLKR } from '../../utils/currency';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed, cancelled
  const [selectedSlipId, setSelectedSlipId] = useState(null); // 🔥 Changed to store ID
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  useEffect(() => {
    fetchOrders();
  }, [activeTab]); 

  const fetchOrders = async () => {
    try {
        const { data } = await apiClient.get(`/orders?status=${activeTab}`);
        setOrders(data);
        setCurrentPage(1); 
    } catch (error) {
        console.error("Error fetching orders");
    }
  };

  const handleApprove = async (id) => {
    if(window.confirm("Approve payment & move to Assign Pool?")) {
        await apiClient.put(`/orders/${id}/verify`);
        fetchOrders();
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if(reason) {
        await apiClient.put(`/orders/${id}/status`, { status: 'cancelled', reason });
        fetchOrders();
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase text-white border-l-4 border-[var(--gta-green)] pl-4">
              Order Management
          </h2>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-700 mt-4 md:mt-0">
              {['pending', 'completed', 'cancelled'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                        activeTab === tab 
                        ? 'bg-[var(--gta-green)] text-black shadow-lg' 
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {/* --- ORDERS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {currentOrders.map(order => (
            <div key={order._id} className="bg-zinc-900 border border-zinc-700 p-5 rounded-xl flex flex-col gap-3 group hover:border-[var(--gta-green)] transition-all relative overflow-hidden">
                
                {/* Status Strip */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                }`}></div>

                <div className="flex justify-between items-start pl-2">
                    <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Package</span>
                        <h3 className="font-bold text-white text-lg leading-tight truncate max-w-[200px]">{order.packageDetails.title}</h3>
                    </div>
                    {activeTab === 'pending' && (
                        <span className="text-yellow-500 text-[10px] font-bold uppercase px-2 py-1 bg-yellow-900/20 rounded border border-yellow-900/50 animate-pulse">Action Needed</span>
                    )}
                </div>
                
                <p className="pl-2 text-[var(--gta-green)] font-sans font-bold text-xl">{formatLKR(order.packageDetails.price)}</p>
                
                <div className="ml-2 bg-black/40 p-3 rounded-lg text-xs text-zinc-400 space-y-2 border border-zinc-800">
                    <p className="flex justify-between border-b border-white/5 pb-1"><span>Customer</span> <span className="text-white font-bold">{order.customer.name}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-1"><span>Contact</span> <span className="text-white font-bold">{order.customer.contact}</span></p>
                    <p className="flex justify-between"><span>Date</span> <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                </div>

                {/* Actions (Only for Pending) */}
                {activeTab === 'pending' ? (
                    <div className="flex gap-2 mt-auto pt-4 pl-2">
                        {/* 🔥 FIX: Pass Order ID here */}
                        <button onClick={() => setSelectedSlipId(order._id)} className="flex-1 bg-zinc-800 py-3 rounded-lg text-xs font-bold uppercase flex justify-center items-center gap-2 hover:bg-white hover:text-black transition-colors"><Eye size={16}/> Slip</button>
                        
                        <button onClick={() => handleApprove(order._id)} className="flex-1 bg-[var(--gta-green)] py-3 rounded-lg text-xs font-bold uppercase flex justify-center items-center gap-2 text-black hover:bg-emerald-500 transition-colors shadow-lg shadow-green-900/20"><Check size={16}/> Accept</button>
                        <button onClick={() => handleReject(order._id)} className="px-4 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"><X size={18}/></button>
                    </div>
                ) : (
                    <div className="mt-auto pt-4 pl-2 flex justify-between items-center text-xs uppercase font-bold text-zinc-500">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(order.updatedAt).toLocaleTimeString()}</span>
                        {activeTab === 'completed' ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Completed</span> : <span className="text-red-500 flex items-center gap-1"><XCircle size={14}/> Cancelled</span>}
                    </div>
                )}
            </div>
        ))}
        {orders.length === 0 && <div className="col-span-3 text-center py-20 text-zinc-600 font-bold uppercase bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">No Orders Found</div>}
      </div>

      {/* --- PAGINATION --- */}
      {orders.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-6 mt-10">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white disabled:opacity-50 hover:border-[var(--gta-green)] transition-all hover:scale-105"
              >
                  <ChevronLeft size={20}/>
              </button>
              <span className="text-sm font-bold text-zinc-400 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                  Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white disabled:opacity-50 hover:border-[var(--gta-green)] transition-all hover:scale-105"
              >
                  <ChevronRight size={20}/>
              </button>
          </div>
      )}

      {/* --- SLIP MODAL (FIXED) --- */}
      {selectedSlipId && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSlipId(null)}>
              <div className="relative max-w-2xl w-full">
                <button className="absolute -top-12 right-0 text-zinc-400 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full"><X/></button>
                
                {/* 🔥 FIX: Load Image from Backend API */}
                <img 
                    src={`https://api.dark-console.com/api/orders/${selectedSlipId}/payment-slip`} 
                    className="w-full rounded-xl border border-zinc-700 shadow-2xl" 
                    alt="Payment Slip"
                />
              </div>
          </div>
      )}
    </div>
  );
};

export default Orders;