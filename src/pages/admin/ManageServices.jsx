import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Upload, X, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { formatLKR } from '../../utils/currency';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'Mod Accounts', image: ''
  });

  // Fetch Services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/services');
      console.log("Admin: Services Fetched:", data); // Check Console
      setServices(data || []);
      setError(null);
    } catch (err) {
      console.error("Admin: Fetch Error:", err);
      setError("Failed to load services. Check Backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 5MB Limit check
      if (file.size > 5 * 1024 * 1024) {
          alert("File is too big! Please select an image under 5MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/services', formData);
      alert("Service Added Successfully!");
      setIsAdding(false);
      setFormData({ title: '', description: '', price: '', category: 'Mod Accounts', image: '' });
      fetchServices(); // Refresh List
    } catch (err) {
      console.error("Add Service Error:", err.response);
      alert(err.response?.data?.message || "Failed to add service. Check image size or backend.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this service?")) {
      try {
        await apiClient.delete(`/services/${id}`);
        fetchServices();
      } catch (err) {
        alert("Delete Failed");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-white">Store Inventory</h2>
          <p className="text-zinc-500 text-sm mt-1">Manage Boosts, Accounts & Packages</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 uppercase tracking-wide"
        >
          <Plus size={18}/> Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle/> {error}
          </div>
      )}

      {/* Loading State */}
      {loading ? (
          <p className="text-white text-center py-10 animate-pulse">Loading Inventory...</p>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {services.map(service => (
                 <div key={service._id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-6 items-center hover:border-zinc-600 transition-all">
                    <div className="w-full md:w-32 h-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-700">
                       {service.image ? (
                           <img src={service.image} alt={service.title} className="w-full h-full object-cover"/>
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-600"><Package/></div>
                       )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                       <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-white">{service.title}</h4>
                          <span className="text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded w-fit mx-auto md:mx-0">
                            {service.category}
                          </span>
                       </div>
                       <p className="text-zinc-500 text-sm line-clamp-1 mb-2">{service.description}</p>
                       <p className="text-[var(--gta-green)] font-mono font-bold text-lg">{formatLKR(service.price)}</p>
                    </div>

                    <button onClick={() => handleDelete(service._id)} className="bg-red-500/10 text-red-500 p-3 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                       <Trash2 size={20}/>
                    </button>
                 </div>
              ))}
              
              {services.length === 0 && !error && (
                  <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                      <Package size={48} className="text-zinc-600 mx-auto mb-4"/>
                      <p className="text-zinc-500 text-xl font-bold uppercase">Inventory is Empty</p>
                      <p className="text-zinc-600 text-sm">Click "Add Product" to create your first item.</p>
                  </div>
              )}
          </div>
      )}

      {/* Add Service Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X/></button>
            <h3 className="text-2xl font-black uppercase text-white mb-6">Add New Item</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Service Title" required 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"
                />
                 <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"
                  >
                      <option>Mod Accounts</option>
                      <option>Boost</option>
                      <option>Packages</option>
                  </select>
              </div>

              <textarea placeholder="Description" required rows="4"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"
              ></textarea>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <input type="number" placeholder="Price (LKR)" required 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-[var(--gta-green)]"
                  />
                  
                  <label className="flex items-center gap-3 cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg border border-zinc-600 transition-colors">
                      <Upload size={20} className="text-[var(--gta-green)]"/>
                      <span className="text-sm text-zinc-300 truncate">
                        {formData.image ? "Image Selected" : "Upload Image (<5MB)"}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!formData.image}/>
                  </label>
              </div>

              {formData.image && (
                <div className="h-32 w-full bg-black rounded-lg overflow-hidden border border-zinc-800">
                   <img src={formData.image} alt="Preview" className="w-full h-full object-cover"/>
                </div>
              )}

              <button type="submit" className="w-full bg-[var(--gta-green)] text-black font-black uppercase py-4 rounded-lg mt-4 hover:bg-emerald-500">
                Publish Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;