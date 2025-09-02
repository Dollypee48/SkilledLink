// frontend/src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/Layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
import { Edit, Trash2, Ban, UserCheck } from 'lucide-react'; // Icons for actions

const ManageUsers = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(accessToken);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsSuspended(user.isSuspended);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      if (newRole !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser._id, newRole, accessToken);
      }
      if (isSuspended !== selectedUser.isSuspended) {
        await adminService.suspendUser(selectedUser._id, isSuspended, accessToken);
      }
      // Refresh user list
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId, accessToken);
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const toggleSuspend = async (user) => {
    try {
      await adminService.suspendUser(user._id, !user.isSuspended, accessToken);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle suspension status');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>
          <p>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 text-[#151E3D]">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Suspended</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.role}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${user.isSuspended ? 'text-red-900' : 'text-green-900'}`}>
                      <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${user.isSuspended ? 'bg-red-200' : 'bg-green-200'}`}></span>
                      <span className="relative">{user.isSuspended ? 'Yes' : 'No'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-3">
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => toggleSuspend(user)} className={`${user.isSuspended ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`} title={user.isSuspended ? "Unsuspend User" : "Suspend User"}>
                        {user.isSuspended ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User: {selectedUser.name}</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="customer">customer</option>
                  <option value="artisan">artisan</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox" checked={isSuspended} onChange={(e) => setIsSuspended(e.target.checked)} />
                  <span className="ml-2 text-gray-700">Suspended</span>
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowEditModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
                <button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;
