import React, { useState, useEffect } from 'react';
import { 
    Users, DollarSign, ShoppingBag, Video, Save, 
    Briefcase, CheckCircle, XCircle, Layout, Calendar, 
    MessageSquare, Trophy, Star, Settings 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [streamLink, setStreamLink] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const resStats = await apiClient.get('/orders/admin/stats');
          setStats(resStats.data);
          
          if(resStats.data.role === 'super-admin') {
             const resStream = await apiClient.get('/settings/stream');
             setStreamLink(resStream.data.link);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const saveStream = async () => {
      try {
          await apiClient.post('/settings/stream', { link: streamLink });
          alert("Stream Updated!");
      } catch (err) { alert("Error saving stream"); }
  };

  if (loading) return <div className="text-white p-10">Loading Dashboard...</div>;

  // --- 🟢 NORMAL ADMIN DASHBOARD ---
  if (stats?.role === 'admin') {
      return (
        <div className="p-6">
            <h2 className="text-3xl font-black uppercase text-white mb-2">My Dashboard</h2>
            <p className="text-zinc-500 mb-8">Welcome back, Agent. Here is your mission status.</p>

            {/* 1. My Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Briefcase} label="Assigned Jobs" value={stats.assigned} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20"/>
                <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="text-[var(--gta-green)]" bg="bg-green-500/10" border="border-green-500/20"/>
                <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20"/>
                <StatCard icon={Layout} label="Pool Jobs" value={stats.poolCount} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20"/>
            </div>

            {/* 2. Quick Actions (Grid) */}
            <h3 className="text-xl font-bold text-white mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickLinkCard icon={Briefcase} label="My Jobs" onClick={() => navigate('/admin/my-jobs')} />
                <QuickLinkCard icon={Settings} label="Store Items" onClick={() => navigate('/admin/services')} />
                <QuickLinkCard icon={Calendar} label="Manage Events" onClick={() => navigate('/admin/events')} />
                <QuickLinkCard icon={MessageSquare} label="Chats" onClick={() => navigate('/admin/chats')} />
                <QuickLinkCard icon={Trophy} label="Leaderboard" onClick={() => navigate('/admin/leaderboard')} />
                <QuickLinkCard icon={Star} label="Reviews" onClick={() => navigate('/admin/feedbacks')} />
            </div>
        </div>
      );
  }

  // --- 🔴 SUPER ADMIN DASHBOARD ---
  return (
    <div className="p-6">
        <h2 className="text-3xl font-black uppercase text-white mb-8">Master Control</h2>
        
        {/* 1. Revenue & High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={DollarSign} label="Total Revenue" value={`LKR ${(stats.totalRevenue || 0).toLocaleString()}`} color="text-[var(--gta-green)]" bg="bg-green-500/10" border="border-green-500/20"/>
            <StatCard icon={ShoppingBag} label="Orders Completed" value={stats.completedOrders} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20"/>
            <StatCard icon={Users} label="Active Admins" value={stats.activeAdmins} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20"/>
            <StatCard icon={Layout} label="Services Revenue" value={`LKR ${(stats.serviceRevenue || 0).toLocaleString()}`} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20"/>
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Revenue Analytics</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="_id" stroke="#52525b" fontSize={12} tickFormatter={(str) => str.slice(5)}/>
                            <YAxis stroke="#52525b" fontSize={12}/>
                            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}}/>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Source Breakdown</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Events', amount: stats.eventRevenue },
                            { name: 'Services', amount: stats.serviceRevenue }
                        ]}>
                            <XAxis dataKey="name" stroke="#52525b"/>
                            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}}/>
                            <Bar dataKey="amount" fill="#22c55e" barSize={50} radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 3. Stream Manager */}
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
        </div>
    </div>
  );
};

// --- Sub Components for Clean Code ---

const StatCard = ({ icon: Icon, label, value, color, bg, border }) => (
    <div className={`p-6 rounded-2xl border ${bg} ${border} flex items-center gap-4`}>
        <div className={`p-3 rounded-xl bg-black ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{label}</p>
            <h4 className="text-2xl font-black text-white">{value}</h4>
        </div>
    </div>
);

const QuickLinkCard = ({ icon: Icon, label, onClick }) => (
    <div 
        onClick={onClick}
        className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[var(--gta-green)] hover:bg-black transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
    >
        <Icon size={32} className="text-zinc-500 group-hover:text-[var(--gta-green)] transition-colors"/>
        <span className="text-white font-bold uppercase text-sm">{label}</span>
    </div>
);

export default Dashboard;