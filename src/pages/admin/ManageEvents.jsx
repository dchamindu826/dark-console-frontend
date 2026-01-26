import React, { useState, useEffect } from 'react';
import { Calendar, Upload, Trophy, Trash2, Edit, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
      title: '', description: '', date: '', time: '', type: 'free', mode: 'individual',
      price: 0, maxParticipants: 0, maxCrews: 0, maxCrewMembers: 4, image: '',
      prizes: { first: '', second: '', third: '' }
  });
  const [editingId, setEditingId] = useState(null); // Reserved for future update logic

  // Fetch Events on Mount
  useEffect(() => {
      fetchEvents();
  }, []);

  const fetchEvents = async () => {
      try {
          const { data } = await apiClient.get('/events');
          setEvents(data);
      } catch (error) {
          console.error("Error fetching events", error);
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          // Check Image Size (Optional Safety)
          if(formData.image && formData.image.length > 2 * 1024 * 1024 * 1.33) {
             return alert("Image is too big! Please use an image under 2MB.");
          }

          await apiClient.post('/events', formData);
          alert("Event Created Successfully!");
          
          // Reset Form
          setFormData({
              title: '', description: '', date: '', time: '', type: 'free', mode: 'individual',
              price: 0, maxParticipants: 0, maxCrews: 0, maxCrewMembers: 4, image: '',
              prizes: { first: '', second: '', third: '' }
          });
          
          // Refresh List
          fetchEvents();
      } catch (error) {
          alert("Failed to create event. Check backend logs.");
      }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure? This will delete the event and close its chat.")) {
          try {
              await apiClient.delete(`/events/${id}`);
              alert("Event Deleted!");
              fetchEvents(); // Refresh List
          } catch (error) {
              alert("Failed to delete event. Check backend.");
          }
      }
  };

  const handleImage = (e) => {
      const file = e.target.files[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormData({...formData, image: reader.result});
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="p-6">
        <h2 className="text-3xl font-black uppercase text-white mb-6">Event Manager</h2>
        
        {/* --- CREATE EVENT FORM --- */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl space-y-6 max-w-4xl mb-12">
            <h3 className="text-xl font-bold text-white uppercase border-b border-zinc-700 pb-2">Create New Event</h3>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Event Title" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                <div className="flex gap-4">
                    <input type="date" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white w-full outline-none focus:border-[var(--gta-green)]"/>
                    <input type="time" required value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white w-full outline-none focus:border-[var(--gta-green)]"/>
                </div>
            </div>

            <textarea placeholder="Description" required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white h-24 outline-none focus:border-[var(--gta-green)]"/>

            {/* Type & Mode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]">
                    <option value="free">Free Entry</option>
                    <option value="paid">Paid Entry</option>
                </select>
                <select value={formData.mode} onChange={e=>setFormData({...formData, mode: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]">
                    <option value="individual">Individual</option>
                    <option value="crew">Crew / Team</option>
                </select>
                {formData.type === 'paid' && (
                    <input type="number" placeholder="Entry Fee (LKR)" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white md:col-span-2 outline-none focus:border-[var(--gta-green)]"/>
                )}
            </div>

            {/* Limits */}
            <div className="bg-black/30 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.mode === 'individual' ? (
                    <input type="number" placeholder="Max Participants" value={formData.maxParticipants} onChange={e=>setFormData({...formData, maxParticipants: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                ) : (
                    <>
                        <input type="number" placeholder="Max Crews" value={formData.maxCrews} onChange={e=>setFormData({...formData, maxCrews: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                        <input type="number" placeholder="Members per Crew" value={formData.maxCrewMembers} onChange={e=>setFormData({...formData, maxCrewMembers: e.target.value})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                    </>
                )}
            </div>

            {/* Prizes */}
            <div className="space-y-2">
                <h4 className="text-zinc-500 font-bold uppercase text-xs flex items-center gap-2"><Trophy size={14}/> Prize Pool</h4>
                <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="1st Place" value={formData.prizes.first} onChange={e=>setFormData({...formData, prizes: {...formData.prizes, first: e.target.value}})} className="bg-black border border-yellow-900/50 p-3 rounded-lg text-white outline-none focus:border-yellow-500"/>
                    <input type="text" placeholder="2nd Place" value={formData.prizes.second} onChange={e=>setFormData({...formData, prizes: {...formData.prizes, second: e.target.value}})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                    <input type="text" placeholder="3rd Place" value={formData.prizes.third} onChange={e=>setFormData({...formData, prizes: {...formData.prizes, third: e.target.value}})} className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"/>
                </div>
            </div>

            {/* Image */}
            <label className="block w-full border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-[var(--gta-green)] transition-colors">
                <Upload className="mx-auto text-zinc-500 mb-2"/>
                <span className="text-zinc-400 font-bold uppercase text-sm">{formData.image ? "Image Selected" : "Upload Event Banner"}</span>
                <input type="file" className="hidden" onChange={handleImage} accept="image/*"/>
            </label>

            <button type="submit" className="w-full bg-[var(--gta-green)] hover:bg-emerald-500 text-black font-black uppercase py-4 rounded-xl transition-all hover:scale-[1.01]">
                Create Event
            </button>
        </form>

        {/* --- EVENT LIST SECTION (NEW) --- */}
        <div>
            <h3 className="text-2xl font-bold text-white uppercase mb-6 border-l-4 border-[var(--gta-green)] pl-4">Active Events</h3>
            
            {events.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl p-10 text-center">
                    <p className="text-zinc-500 font-bold uppercase">No Active Events</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event._id} className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden group hover:border-[var(--gta-green)] transition-all">
                            
                            {/* Image & Badge */}
                            <div className="h-48 overflow-hidden relative">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold uppercase text-[var(--gta-green)] border border-white/10">
                                    {event.mode}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5">
                                <h4 className="text-xl font-bold text-white mb-2 truncate">{event.title}</h4>
                                
                                <div className="flex justify-between items-center text-zinc-400 text-xs mb-4">
                                    <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded"><Calendar size={12}/> {event.date}</span>
                                    <span className="bg-black/40 px-2 py-1 rounded">{event.time}</span>
                                </div>

                                <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                                    <span className={`font-black font-mono text-lg ${event.price === 0 ? 'text-white' : 'text-[var(--gta-green)]'}`}>
                                        {event.price === 0 ? 'FREE' : `LKR ${event.price}`}
                                    </span>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleDelete(event._id)} 
                                            className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                            title="Delete Event"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
export default ManageEvents;