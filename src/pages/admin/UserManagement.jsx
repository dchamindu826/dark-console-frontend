import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Edit } from 'lucide-react';
import apiClient from '../../api/client';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', telegramChatId: '', role: 'admin' });
  const [editingId, setEditingId] = useState(null); // Edit Mode

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await apiClient.get('/auth/users'); // Ensure route exists
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(editingId) {
            await apiClient.put(`/auth/${editingId}`, formData);
            alert("Updated!");
            setEditingId(null);
        } else {
            await apiClient.post('/auth/register', formData);
            alert("Created!");
        }
        setFormData({ username: '', password: '', telegramChatId: '', role: 'admin' });
        fetchUsers();
    } catch (error) {
        alert("Operation Failed");
    }
  };

  const handleEdit = (user) => {
      setFormData({ username: user.username, password: '', telegramChatId: user.telegramChatId || '', role: user.role });
      setEditingId(user._id);
  };

  const handleDelete = async (id) => {
      if(window.confirm("Delete User?")) {
          await apiClient.delete(`/auth/${id}`);
          fetchUsers();
      }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl h-fit">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="text-[var(--gta-green)]"/> {editingId ? 'Edit User' : 'Create New Agent'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Username" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded text-white" />
                <input type="password" placeholder={editingId ? "New Password (Leave empty to keep)" : "Password"} required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded text-white" />
                <input type="text" placeholder="Telegram Chat ID" value={formData.telegramChatId} onChange={e => setFormData({...formData, telegramChatId: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded text-white" />
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded text-white">
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                </select>
                <button type="submit" className="bg-[var(--gta-green)] text-black font-bold py-3 w-full rounded uppercase hover:bg-emerald-500">
                    {editingId ? 'Update User' : 'Create Account'}
                </button>
                {editingId && <button onClick={() => {setEditingId(null); setFormData({ username: '', password: '', telegramChatId: '', role: 'admin' })}} className="text-zinc-500 text-xs w-full mt-2">Cancel Edit</button>}
            </form>
        </div>

        {/* User List */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-black/40 text-xs uppercase text-zinc-500">
                    <tr><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {users.map(u => (
                        <tr key={u._id} className="hover:bg-white/5">
                            <td className="p-4 text-white font-bold">{u.username}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${u.role === 'super-admin' ? 'bg-purple-900 text-purple-400' : 'bg-blue-900 text-blue-400'}`}>{u.role}</span></td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => handleEdit(u)} className="text-zinc-400 hover:text-white"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
export default UserManagement;