import React, { useState, useEffect } from 'react';
import { UserPlus, Activity, CheckCircle, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import { formatLKR } from '../../utils/currency';

const AssignPool = () => {
  const [poolOrders, setPoolOrders] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]); // Monitoring
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const resPool = await apiClient.get('/orders?status=pool');
    const resActive = await apiClient.get('/orders?status=in_progress');
    const resAdmins = await apiClient.get('/auth/admins');
    
    setPoolOrders(resPool.data);
    setActiveJobs(resActive.data);
    setAdmins(resAdmins.data);
  };

  const handleAssign = async (orderId, adminId) => {
      if(!adminId) return alert("Select an admin!");
      await apiClient.put(`/orders/${orderId}/assign`, { adminId });
      fetchData();
      alert("Job Assigned! Admin notified on Telegram.");
  };

  return (
    <div className="p-6 space-y-12">
        
        {/* SECTION 1: ASSIGNMENT AREA */}
        <div>
            <h2 className="text-2xl font-black uppercase text-white mb-4 border-l-4 border-[var(--gta-green)] pl-4">
                Ready to Assign <span className="text-zinc-500 text-sm">({poolOrders.length})</span>
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-black/40 text-xs uppercase text-zinc-500 font-bold">
                        <tr>
                            <th className="p-4">Package</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Assign To</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {poolOrders.map(order => (
                            <tr key={order._id} className="hover:bg-white/5">
                                <td className="p-4 font-bold text-white">{order.packageDetails.title}</td>
                                <td className="p-4">{order.customer.name}</td>
                                <td className="p-4">
                                    <select id={`assign-${order._id}`} className="bg-black border border-zinc-700 rounded p-2 text-white text-xs outline-none focus:border-[var(--gta-green)]">
                                        <option value="">Select Admin...</option>
                                        {admins.map(a => <option key={a._id} value={a._id}>{a.username}</option>)}
                                    </select>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleAssign(order._id, document.getElementById(`assign-${order._id}`).value)} className="bg-white hover:bg-[var(--gta-green)] text-black px-4 py-2 rounded text-xs font-bold uppercase">Assign</button>
                                </td>
                            </tr>
                        ))}
                        {poolOrders.length === 0 && <tr><td colSpan="4" className="p-6 text-center italic">Pool is empty.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        {/* SECTION 2: LIVE MONITORING */}
        <div>
            <h2 className="text-2xl font-black uppercase text-white mb-4 border-l-4 border-blue-500 pl-4">
                Live Status Monitor <span className="text-zinc-500 text-sm">({activeJobs.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeJobs.map(job => (
                    <div key={job._id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-white">{job.packageDetails.title}</h4>
                            <p className="text-xs text-zinc-500">Handler: <span className="text-[var(--gta-green)] font-bold">{job.assignedAdmin?.username}</span></p>
                        </div>
                        <div className="text-right">
                            <span className="bg-blue-900/30 text-blue-400 text-[10px] font-bold uppercase px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1 justify-end">
                                <Activity size={10} className="animate-pulse"/> In Progress
                            </span>
                            <p className="text-[10px] text-zinc-600 mt-1">Customer: {job.customer.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    </div>
  );
};
export default AssignPool;