import React, { useState, useEffect } from 'react';
import { Trophy, Upload, Save, User } from 'lucide-react';
import apiClient from '../../api/client';

const ManageLeaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize 5 slots
  const ranks = [1, 2, 3, 4, 5];

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const { data } = await apiClient.get('/leaderboard');
          setPlayers(data);
      } catch (err) { console.error(err); }
  };

  const handleUpdate = async (rank, formData) => {
      try {
          setLoading(true);
          await apiClient.post('/leaderboard', { ...formData, rank });
          alert(`Rank ${rank} Updated!`);
          fetchData();
      } catch (err) {
          alert("Failed to update.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-6">
        <h2 className="text-3xl font-black uppercase text-white mb-8 flex items-center gap-2">
            <Trophy className="text-yellow-500"/> Manage Hall of Fame
        </h2>

        <div className="grid grid-cols-1 gap-6">
            {ranks.map(rank => {
                const existing = players.find(p => p.rank === rank) || {};
                return (
                    <RankCard 
                        key={rank} 
                        rank={rank} 
                        data={existing} 
                        onSave={handleUpdate} 
                        loading={loading}
                    />
                );
            })}
        </div>
    </div>
  );
};

// Single Rank Edit Component
const RankCard = ({ rank, data, onSave, loading }) => {
    const [name, setName] = useState(data.name || "");
    const [points, setPoints] = useState(data.points || "");
    const [image, setImage] = useState(data.avatar || "");

    // Update local state when data fetches
    useEffect(() => {
        setName(data.name || "");
        setPoints(data.points || "");
        setImage(data.avatar || "");
    }, [data]);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center">
            {/* Rank Indicator */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 ${
                rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500' :
                rank === 2 ? 'bg-zinc-400/20 text-zinc-400 border-zinc-400' :
                rank === 3 ? 'bg-orange-700/20 text-orange-700 border-orange-700' :
                'bg-zinc-800 text-zinc-500 border-zinc-600'
            }`}>
                #{rank}
            </div>

            {/* Image Upload */}
            <div className="relative group w-20 h-20 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-zinc-700">
                    {image ? <img src={image} className="w-full h-full object-cover"/> : <User className="w-full h-full p-4 text-zinc-600"/>}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-all">
                    <Upload size={20} className="text-white"/>
                    <input type="file" className="hidden" onChange={handleImage} accept="image/*"/>
                </label>
            </div>

            {/* Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Name (Crew/Gamer)</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white font-bold" placeholder="e.g. ShadowKiller"/>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Points</label>
                    <input value={points} onChange={e=>setPoints(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-[var(--gta-green)] font-mono font-bold" placeholder="e.g. 2500"/>
                </div>
            </div>

            {/* Save Button */}
            <button 
                onClick={() => onSave(rank, { name, points, avatar: image })}
                disabled={loading}
                className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black p-4 rounded-xl transition-all"
            >
                <Save size={24}/>
            </button>
        </div>
    );
};

export default ManageLeaderboard;