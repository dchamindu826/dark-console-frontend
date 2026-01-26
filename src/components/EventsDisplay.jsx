import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Calendar, ArrowRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventsDisplay = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiClient.get('/events').then(res => setEvents(res.data)).catch(console.error);
    }, []);

    if (events.length === 0) return null;

    return (
        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[400px] bg-[var(--gta-green)]/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header Section (Centered & Mobile Responsive) */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight mb-3">
                        Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gta-green)] to-emerald-800">Events</span>
                    </h2>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-6">Compete. Win. Dominate.</p>
                    
                    <div className="flex justify-center">
                        <button 
                            onClick={() => navigate('/events')} 
                            className="bg-zinc-900 border border-zinc-700 hover:border-[var(--gta-green)] text-white px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase transition-all group hover:bg-[var(--gta-green)] hover:text-black"
                        >
                            View All Tournaments <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {events.slice(0, 3).map(event => (
                        <div 
                            key={event._id} 
                            onClick={() => navigate('/events')} 
                            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-zinc-800 hover:border-[var(--gta-green)] transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] bg-zinc-900 flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="h-56 md:h-64 overflow-hidden relative">
                                <img 
                                    src={event.image} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={event.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                    <Calendar size={14} className="text-[var(--gta-green)]"/>
                                    <span className="text-white text-xs font-bold uppercase">{event.date}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6 relative flex-1 flex flex-col">
                                <div className="absolute -top-5 right-6 bg-[var(--gta-green)] text-black px-3 py-1 rounded font-black text-[10px] md:text-xs uppercase shadow-lg">
                                    {event.mode}
                                </div>
                                
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-2 group-hover:text-[var(--gta-green)] transition-colors line-clamp-1">{event.title}</h3>
                                <p className="text-zinc-500 text-xs md:text-sm line-clamp-2 mb-4 flex-1">{event.description}</p>
                                
                                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                                    <div className="flex items-center gap-2 text-[var(--gta-green)]">
                                        <Trophy size={16}/>
                                        <span className="text-[10px] md:text-xs font-bold uppercase">Prize Pool Active</span>
                                    </div>
                                    <span className="text-white text-[10px] md:text-xs font-bold uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        Join Now <ArrowRight size={12}/>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventsDisplay;