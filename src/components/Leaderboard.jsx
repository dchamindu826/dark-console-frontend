import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Shield } from 'lucide-react';
import apiClient from '../api/client';

const Leaderboard = () => {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
      apiClient.get('/leaderboard').then(res => setWinners(res.data)).catch(console.error);
  }, []);

  const getPlayer = (rank) => winners.find(p => p.rank === rank);
  const topThree = [getPlayer(2), getPlayer(1), getPlayer(3)]; 
  const others = winners.filter(p => p.rank > 3);

  if (winners.length === 0) return null;

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gta-green)]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-4 drop-shadow-lg">
            Hall of <span className="text-[var(--gta-green)]">Fame</span>
          </h2>
          <div className="h-1 w-24 bg-[var(--gta-green)] mx-auto rounded-full"></div>
        </div>

        {/* --- TOP 3 PODIUM (NEW DESIGN) --- */}
        <div className="flex flex-wrap justify-center items-end gap-6 md:gap-10 mb-16">
          {topThree.map((player, index) => {
             if (!player) return null;
             const isFirst = player.rank === 1;
             
             return (
              <motion.div 
                key={player.rank}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex flex-col items-center ${isFirst ? 'order-2 -mt-10' : 'order-1'}`}
              >
                {/* Crown for #1 */}
                {isFirst && (
                    <motion.div 
                        animate={{ y: [0, -10, 0] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mb-4 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                    >
                        <Crown size={48} fill="currentColor"/>
                    </motion.div>
                )}

                {/* Avatar Card */}
                <div className={`
                    relative p-1 rounded-2xl bg-gradient-to-b 
                    ${isFirst ? 'from-yellow-400 to-orange-600 w-48' : player.rank === 2 ? 'from-zinc-300 to-zinc-500 w-40' : 'from-orange-400 to-amber-800 w-40'}
                `}>
                    <div className="bg-zinc-900 rounded-xl p-1 overflow-hidden relative">
                        {/* 🔥 FIXED IMAGE URL FOR TOP 3 WITH ERROR HANDLING */}
                        <img 
                            src={`https://api.dark-console.com/api/leaderboard/${player._id}/image`} 
                            className="w-full aspect-square object-cover rounded-lg" 
                            alt={player.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; }}
                        />
                        
                        {/* Rank Badge */}
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-3 py-1 rounded text-white font-black text-sm border border-white/10">
                            #{player.rank}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="text-center mt-4">
                    <h3 className={`font-black uppercase tracking-wider ${isFirst ? 'text-2xl text-white' : 'text-xl text-zinc-300'}`}>
                        {player.name}
                    </h3>
                    <div className="inline-flex items-center gap-2 mt-1 px-4 py-1 rounded-full bg-[var(--gta-green)]/10 border border-[var(--gta-green)]/20 text-[var(--gta-green)] font-mono font-bold">
                        <Trophy size={14}/> {player.points} PTS
                    </div>
                </div>
              </motion.div>
             )
          })}
        </div>

        {/* --- OTHERS LIST (NEW DESIGN) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {others.map((player, idx) => (
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={player.rank}
                    className="flex items-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-[var(--gta-green)] hover:bg-zinc-900 transition-all group"
                >
                    <div className="font-black text-zinc-600 text-2xl w-12 group-hover:text-[var(--gta-green)] transition-colors">#{player.rank}</div>
                    
                    {/* 🔥 FIXED IMAGE URL FOR OTHERS WITH ERROR HANDLING */}
                    <img 
                        src={`https://api.dark-console.com/api/leaderboard/${player._id}/image`} 
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-700 mr-4" 
                        alt={player.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; }}
                    />
                    
                    <div className="flex-1">
                        <h4 className="font-bold text-white uppercase">{player.name}</h4>
                        <p className="text-xs text-zinc-500 uppercase font-bold">Runner Up</p>
                    </div>
                    <div className="text-white font-mono font-bold bg-black/50 px-3 py-1 rounded border border-white/5">
                        {player.points}
                    </div>
                </motion.div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default Leaderboard;