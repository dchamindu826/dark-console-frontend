import React, { useState, useEffect } from 'react';
import { Star, Upload, Trash2, MessageSquare, Plus } from 'lucide-react';
import apiClient from '../../api/client';

const ManageFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', rating: 5, avatar: '' });

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = () => {
      apiClient.get('/feedbacks').then(res => setFeedbacks(res.data));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await apiClient.post('/feedbacks', form);
          alert("Feedback Added!");
          setForm({ name: '', message: '', rating: 5, avatar: '' });
          fetchFeedbacks();
      } catch (err) { alert("Error adding feedback"); }
  };

  const handleDelete = async (id) => {
      if(confirm("Delete this feedback?")) {
          await apiClient.delete(`/feedbacks/${id}`);
          fetchFeedbacks();
      }
  };

  const handleImage = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setForm({...form, avatar: reader.result});
      if(file) reader.readAsDataURL(file);
  };

  return (
    <div className="p-6">
        <h2 className="text-3xl font-black uppercase text-white mb-8">Client Reviews</h2>

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-10 max-w-2xl">
            <h3 className="text-white font-bold mb-4">Add New Feedback</h3>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <input type="text" placeholder="Client Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required className="flex-1 bg-black border border-zinc-700 p-3 rounded text-white"/>
                    <select value={form.rating} onChange={e=>setForm({...form, rating: Number(e.target.value)})} className="bg-black border border-zinc-700 p-3 rounded text-white">
                        {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                </div>
                <textarea placeholder="Feedback Message" value={form.message} onChange={e=>setForm({...form, message: e.target.value})} required className="w-full bg-black border border-zinc-700 p-3 rounded text-white h-24"/>
                
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 px-4 py-2 rounded text-zinc-400 hover:text-white">
                        <Upload size={16}/> {form.avatar ? "Image Selected" : "Upload Photo"}
                        <input type="file" className="hidden" onChange={handleImage} accept="image/*"/>
                    </label>
                    <button type="submit" className="bg-[var(--gta-green)] text-black px-6 py-2 rounded font-bold uppercase hover:bg-emerald-500">Post Review</button>
                </div>
            </div>
        </form>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbacks.map(fb => (
                <div key={fb._id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex gap-4 relative group">
                    <img src={fb.avatar} className="w-12 h-12 rounded-full object-cover bg-black"/>
                    <div>
                        <h4 className="text-white font-bold">{fb.name}</h4>
                        <div className="flex text-yellow-500 text-xs mb-1">{[...Array(fb.rating)].map((_,i)=><Star key={i} size={10} fill="currentColor"/>)}</div>
                        <p className="text-zinc-500 text-xs line-clamp-2">{fb.message}</p>
                    </div>
                    <button onClick={() => handleDelete(fb._id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};
export default ManageFeedbacks;