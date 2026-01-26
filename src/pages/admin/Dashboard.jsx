import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingBag, Video, Save } from 'lucide-react'; // Import Video icon
import apiClient from '../../api/client';

const Dashboard = () => {
  const [stats, setStats] = useState({ assigned: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
  const [streamLink, setStreamLink] = useState(""); // State for stream

  useEffect(() => {
      // Fetch Stats
      apiClient.get('/orders/admin/stats').then(res => setStats(res.data));
      // Fetch Current Stream
      apiClient.get('/settings/stream').then(res => setStreamLink(res.data.link));
  }, []);

  const saveStream = async () => {
      try {
          await apiClient.post('/settings/stream', { link: streamLink });
          alert("Stream Updated!");
      } catch (err) { alert("Error saving stream"); }
  };

  return (
    <div className="p-6">
        <h2 className="text-3xl font-black uppercase text-white mb-8">Dashboard Overview</h2>
        
        {/* Stats Cards (Keep existing ones) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* ... (Your existing stats cards) ... */}
        </div>

        {/* --- LIVE STREAM MANAGER --- */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-10">
            <h3 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Video className="text-red-500"/> Live Stream Manager
            </h3>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    placeholder="Paste YouTube Embed Link (or Video ID)" 
                    value={streamLink}
                    onChange={(e) => setStreamLink(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-[var(--gta-green)]"
                />
                <button onClick={saveStream} className="bg-[var(--gta-green)] text-black px-6 rounded-xl font-bold uppercase hover:bg-emerald-500 flex items-center gap-2">
                    <Save size={18}/> Save
                </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Leave empty to hide the stream section on the homepage.</p>
        </div>
    </div>
  );
};
export default Dashboard;