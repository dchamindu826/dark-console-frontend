import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

// Public Components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsBanner from './components/StatsBanner';
import Leaderboard from './components/Leaderboard';
import Services from './pages/Services'; 
import Profile from './pages/Profile'; 
import Events from './pages/Events';
import EventsDisplay from './components/EventsDisplay';
import FeedbackDisplay from './components/FeedbackDisplay'; // 🔥 NEW

// Admin Components
import AdminLogin from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import AssignPool from './pages/admin/AssignPool';
import MyJobs from './pages/admin/MyJobs';
import ManageServices from './pages/admin/ManageServices';
import UserManagement from './pages/admin/UserManagement';
import ManageEvents from './pages/admin/ManageEvents';
import AdminChats from './pages/admin/AdminChats';
import ManageLeaderboard from './pages/admin/ManageLeaderboard';
import ManageFeedbacks from './pages/admin/ManageFeedbacks'; // 🔥 NEW

// Utils & API
import apiClient from './api/client';
import { formatLKR } from './utils/currency';

// --- LIVE STREAM COMPONENT ---
const LiveStream = () => {
    const [link, setLink] = useState("");
    useEffect(() => {
        apiClient.get('/settings/stream').then(res => setLink(res.data.link)).catch(() => {});
    }, []);

    if (!link) return null;
    const videoId = link.includes('v=') ? link.split('v=')[1].split('&')[0] : link.split('/').pop();

    return (
        <section className="py-20 px-4 bg-black relative border-y border-zinc-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                    <h2 className="text-2xl font-black uppercase text-white tracking-widest">Live Transmission</h2>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                        title="Live Stream"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

// --- PORTRAIT PACKAGES COMPONENT (FONT FIXED) ---
const FeaturedPackages = () => {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiClient.get('/services').then(res => setServices(res.data)).catch(console.error);
    }, []);

    if(services.length === 0) return null;

    return (
        <section className="py-24 px-4 bg-zinc-900/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white">
                        Elite <span className="text-[var(--gta-green)]">Packages</span>
                    </h2>
                    <p className="text-zinc-400 mt-2">Unlock your full potential.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {services.slice(0, 4).map(service => ( 
                        <div key={service._id} className="group relative bg-black border border-zinc-800 rounded-2xl overflow-hidden hover:border-[var(--gta-green)] transition-all duration-300 hover:-translate-y-2">
                            
                            <div className="aspect-[2/3] w-full relative overflow-hidden">
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                                
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Starting at</p>
                                    {/* 🔥 FONT FIXED: Changed from font-mono to font-sans font-black */}
                                    <p className="text-2xl font-black text-[var(--gta-green)] font-sans tracking-tight drop-shadow-md">
                                        {formatLKR(service.price)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 relative">
                                <h3 className="text-lg font-black text-white uppercase leading-tight mb-2 group-hover:text-[var(--gta-green)] transition-colors line-clamp-1">
                                    {service.title}
                                </h3>
                                <div className="h-1 w-10 bg-zinc-700 rounded mb-4 group-hover:w-full group-hover:bg-[var(--gta-green)] transition-all duration-500"></div>
                                
                                <button onClick={() => navigate('/services')} className="w-full py-3 bg-zinc-800 text-white font-bold uppercase text-xs rounded-lg hover:bg-[var(--gta-green)] hover:text-black transition-colors flex items-center justify-center gap-2">
                                    View Details <ArrowRight size={14}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-12">
                    <button onClick={() => navigate('/services')} className="text-white border-b border-[var(--gta-green)] pb-1 hover:text-[var(--gta-green)] transition-colors uppercase text-sm font-bold tracking-widest">
                        View All Store Items
                    </button>
                </div>
            </div>
        </section>
    );
};

// --- Landing Page Layout ---
const LandingPage = () => {
  return (
    <div className="bg-[#09090b] min-h-screen text-white font-sans selection:bg-green-500/30">
      <Header />
      <HeroSection />
      
      <StatsBanner />

      {/* 🔥 1. Live Stream MOVED HERE (Below Stats) */}
      <LiveStream />
      
      <EventsDisplay />
      
      <Leaderboard />
      
      {/* 2. Portrait Packages (Font Fixed) */}
      <FeaturedPackages />

      {/* 🔥 3. Feedback Slider Added Here */}
      <FeedbackDisplay />

      <footer className="py-10 text-center text-zinc-600 text-xs uppercase font-bold tracking-widest border-t border-white/5">
        Dark Console &copy; 2026. All Rights Reserved.
      </footer>
    </div>
  );
};

// --- Main App Component ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<Events />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="assign-pool" element={<AssignPool />} />
            <Route path="my-jobs" element={<MyJobs />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="chats" element={<AdminChats />} />
            <Route path="leaderboard" element={<ManageLeaderboard />} />
            <Route path="feedbacks" element={<ManageFeedbacks />} /> {/* 🔥 NEW ADMIN ROUTE */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;