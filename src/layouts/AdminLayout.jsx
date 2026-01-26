import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingCart, Users, Calendar, 
  LogOut, Layers, Briefcase, Settings, MessageSquare, Trophy, Star // 🔥 Added Star here
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <motion.div
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 mb-2 ${
      active 
        ? 'bg-[var(--gta-green)]/10 text-[var(--gta-green)] border border-[var(--gta-green)]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
        : 'text-zinc-500 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="font-bold text-sm tracking-wide uppercase">{label}</span>
  </motion.div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminInfo');
    if (!storedUser) {
      navigate('/admin/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (!user) return null;

  // --- SUPER ADMIN MENU ---
  const superAdminMenu = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart }, 
    { label: 'Assign Pool', path: '/admin/assign-pool', icon: Layers },      
    { label: 'Store Items', path: '/admin/services', icon: Settings },       
    { label: 'Manage Events', path: '/admin/events', icon: Calendar }, 
    { label: 'Chats', path: '/admin/chats', icon: MessageSquare }, 
    { label: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
    { label: 'Reviews', path: '/admin/feedbacks', icon: Star }, // Now works!
    { label: 'Team', path: '/admin/users', icon: Users },             
  ];

  // --- NORMAL ADMIN MENU ---
  const normalAdminMenu = [
    { label: 'My Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'My Workspace', path: '/admin/my-jobs', icon: Briefcase },      
  ];

  const menuToRender = user.role === 'super-admin' ? superAdminMenu : normalAdminMenu;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-[#09090b] border-r border-white/5 flex flex-col z-50">
        <div className="p-8 border-b border-white/5">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
                Dark<span className="text-[var(--gta-green)]">Console</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                {user.role === 'super-admin' ? 'Master Control' : 'Agent Panel'}
            </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {menuToRender.map((item) => (
                <SidebarItem 
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    active={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                />
            ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[var(--gta-green)] flex items-center justify-center font-bold text-[var(--gta-green)]">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.username}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{user.role}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl font-bold text-xs uppercase transition-all"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-[var(--gta-green)]/5 blur-[150px] pointer-events-none z-0"></div>
         <div className="relative z-10">
            <Outlet />
         </div>
      </main>
    </div>
  );
};

export default AdminLayout;