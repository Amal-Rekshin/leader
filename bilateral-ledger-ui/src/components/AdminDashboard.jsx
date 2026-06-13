import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, Wallet, Activity, Search, Plus, X, ArrowUpRight, ArrowDownLeft, LogOut, Edit, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MetricCard from './MetricCard';
import { ledgerApi } from '../api/ledgerApi';
import { useToast } from '../context/ToastContext';

const formatMoney = (val) => `₹ ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('INVOICE'); // INVOICE or PAYMENT
  const [selectedTxUser, setSelectedTxUser] = useState('');
  const [selectedUserBalance, setSelectedUserBalance] = useState(0);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [txData, setTxData] = useState({ description: '', amount: '' });

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, allLedgerRes] = await Promise.all([
        ledgerApi.getDashboardStats(),
        ledgerApi.getUsers(),
        ledgerApi.getAllLedger()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      
      const entries = allLedgerRes.data;
      const grouped = {};
      entries.forEach(e => {
         const d = new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
         if (!grouped[d]) grouped[d] = { date: d, Debit: 0, Credit: 0 };
         grouped[d].Debit += e.debit || 0;
         grouped[d].Credit += e.credit || 0;
      });
      setChartData(Object.values(grouped));
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchUserLedger = async (userId) => {
    try {
      const res = await ledgerApi.getUserLedger(userId);
      setLedgerEntries(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load user ledger', 'error');
    }
  };

  const fetchAllLedger = async () => {
    try {
      const res = await ledgerApi.getAllLedger();
      setLedgerEntries(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load overall ledger', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await ledgerApi.createUser({ ...formData, role: 'USER' });
      showToast('User created successfully', 'success');
      setIsUserModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (err) {
      showToast('Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await ledgerApi.updateUser(userToEdit.id, formData);
      showToast('User updated successfully', 'success');
      setIsEditUserModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await ledgerApi.deleteUser(userToDelete.id);
      showToast('User deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchData();
      if (selectedUser?.id === userToDelete?.id) {
        setActiveTab('USERS');
        setSelectedUser(null);
      }
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setFormData({ name: user.name, email: user.email, phone: user.phoneNumber || '', password: '' });
    setIsEditUserModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleTxUserChange = async (userId) => {
    setSelectedTxUser(userId);
    if (!userId) {
      setSelectedUserBalance(0);
      return;
    }
    try {
      const res = await ledgerApi.getUserLedger(userId);
      const entries = res.data;
      const balance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
      setSelectedUserBalance(balance);
    } catch (err) {
      console.error(err);
      setSelectedUserBalance(0);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedTxUser) {
      showToast('Please select a user', 'error');
      return;
    }
    
    // Check max limit for payments
    if (transactionType === 'PAYMENT' && parseFloat(txData.amount) > selectedUserBalance) {
      showToast(`Cannot pay more than the remaining balance of ${formatMoney(selectedUserBalance)}`, 'error');
      return;
    }

    try {
      const payload = { userId: selectedTxUser, description: txData.description, amount: parseFloat(txData.amount) };
      if (transactionType === 'INVOICE') {
        await ledgerApi.createInvoice(payload);
        showToast('Invoice created successfully (Debit added)', 'success');
      } else {
        await ledgerApi.recordPayment(payload);
        showToast('Payment recorded successfully (Credit added)', 'success');
      }
      setIsTransactionModalOpen(false);
      setTxData({ description: '', amount: '' });
      setSelectedTxUser('');
      fetchData();
      if (activeTab === 'LEDGER' && selectedUser?.id == selectedTxUser) {
        fetchUserLedger(selectedUser.id);
      }
    } catch (err) {
      showToast(`Failed to record ${transactionType.toLowerCase()}`, 'error');
    }
  };

  const openLedger = (user) => {
    setSelectedUser(user);
    setActiveTab('LEDGER');
    fetchUserLedger(user.id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 md:p-10 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage Users, Invoices, and Ledger</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setActiveTab('DASHBOARD'); setSelectedUser(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>Overview</button>
          <button onClick={() => { setActiveTab('USERS'); setSelectedUser(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>Users</button>
          <button onClick={() => { setActiveTab('OVERALL_LEDGER'); fetchAllLedger(); setSelectedUser(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'OVERALL_LEDGER' ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>Overall Ledger</button>
          <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {activeTab === 'DASHBOARD' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">System Overview</h2>
            <div className="flex gap-3">
              <button onClick={() => { setTransactionType('INVOICE'); setSelectedTxUser(''); setIsTransactionModalOpen(true); }} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                <FileText size={16} /> Create Invoice (Debit)
              </button>
              <button onClick={() => { setTransactionType('PAYMENT'); setSelectedTxUser(''); setSelectedUserBalance(0); setIsTransactionModalOpen(true); }} className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                <Wallet size={16} /> Record Payment (Credit)
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} />
            <MetricCard title="Total Debit (Invoices)" value={formatMoney(stats?.totalDebit)} icon={ArrowUpRight} />
            <MetricCard title="Total Credit (Payments)" value={formatMoney(stats?.totalCredit)} icon={ArrowDownLeft} />
            <MetricCard title="Remaining Balance" value={formatMoney(stats?.remainingBalance)} icon={Wallet} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Pie Chart */}
            <div className="glass-card p-6 border border-white/5 col-span-1 shadow-xl">
               <h3 className="text-white font-bold mb-4">Transaction Distribution</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie 
                         data={[
                           { name: 'Total Debits', value: stats?.totalDebit || 0 },
                           { name: 'Total Credits', value: stats?.totalCredit || 0 }
                         ]} 
                         dataKey="value" 
                         nameKey="name" 
                         cx="50%" 
                         cy="50%" 
                         innerRadius={60} 
                         outerRadius={80} 
                         paddingAngle={5}
                       >
                          <Cell fill="#ef4444" />
                          <Cell fill="#22c55e" />
                       </Pie>
                       <Tooltip formatter={(value) => formatMoney(value)} contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                       <Legend wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Area Chart */}
            <div className="glass-card p-6 border border-white/5 col-span-1 md:col-span-2 shadow-xl">
               <h3 className="text-white font-bold mb-4">Transaction Timeline</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="date" stroke="#666" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#666" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                       <Tooltip formatter={(value) => formatMoney(value)} contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                       <Legend wrapperStyle={{ fontSize: '12px' }} />
                       <Area type="monotone" dataKey="Debit" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDebit)" />
                       <Area type="monotone" dataKey="Credit" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorCredit)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'USERS' && (
        <div className="glass-card flex-1 p-8 flex flex-col border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">User Management</h2>
            <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
              <Plus size={16} /> Create User
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm bg-white/[0.02]">
                  <th className="p-4 font-medium">NAME</th>
                  <th className="p-4 font-medium">EMAIL</th>
                  <th className="p-4 font-medium">PHONE</th>
                  <th className="p-4 font-medium">JOINED</th>
                  <th className="p-4 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.filter(u => u.role !== 'ADMIN').map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-gray-400 font-mono">{user.phoneNumber || '-'}</td>
                    <td className="p-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => openLedger(user)} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-bold transition-all">
                        Ledger
                      </button>
                      <button onClick={() => openEditModal(user)} className="p-1.5 bg-white/10 text-gray-300 hover:bg-white/20 rounded-lg transition-all" title="Edit User">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => openDeleteModal(user)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shared Ledger View */}
      {(activeTab === 'OVERALL_LEDGER' || (activeTab === 'LEDGER' && selectedUser)) && (
        <div className="flex flex-col flex-1 h-full relative">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {activeTab === 'OVERALL_LEDGER' ? 'Overall Ledger' : `Ledger: ${selectedUser.name}`}
              </h2>
              <p className="text-gray-400 text-sm">
                {activeTab === 'OVERALL_LEDGER' ? 'All transactions across all users' : selectedUser.email}
              </p>
            </div>
          </div>

          {/* Dynamic Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="glass-card p-5 md:p-6 border border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">AMOUNT NEED TO BE RECEIVED</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-white">
                {formatMoney(ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0)}
              </p>
            </div>
            <div className="glass-card p-5 md:p-6 border border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">INCOME RECIEVED</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-green-400">
                {formatMoney(ledgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0))}
              </p>
            </div>
            <div className="glass-card p-5 md:p-6 border border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">TOTAL DEBITS</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-red-400">
                {formatMoney(ledgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0))}
              </p>
            </div>
          </div>

          {/* Dynamic Ledger Statement Board */}
          <div className="glass-card flex-1 overflow-x-auto w-full border border-white/5 shadow-2xl flex flex-col">
            {/* Opening Balance */}
            <div className="p-8 border-b border-white/10 text-center bg-white/[0.01]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">OPENING BALANCE</p>
              <p className="text-3xl font-extrabold font-mono text-green-400">
                {formatMoney(0)}
              </p>
            </div>

            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="font-bold text-lg text-white">Statement Entries</h2>
              <span className="text-xs text-gray-500 font-medium font-mono">{ledgerEntries.length} Records</span>
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
                <p className="text-gray-500 font-semibold text-sm">No ledger records found associated with this account scope.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto min-w-[768px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                      <th className="p-5">DATE</th>
                      <th className="p-5">DESCRIPTION</th>
                      <th className="p-5 text-right">DEBIT</th>
                      <th className="p-5 text-right">CREDIT</th>
                      <th className="p-5 text-right">BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map(entry => (
                      <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 text-gray-400 font-mono text-xs">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-5 font-semibold text-white text-sm">{entry.description}</td>
                        <td className="p-5 text-right font-mono text-sm text-red-400 font-bold">{entry.debit > 0 ? formatMoney(entry.debit) : '-'}</td>
                        <td className="p-5 text-right font-mono text-sm text-green-400 font-bold">{entry.credit > 0 ? formatMoney(entry.credit) : '-'}</td>
                        <td className="p-5 text-right font-mono text-sm font-bold text-white">{formatMoney(entry.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Closing Balance */}
            <div className="p-8 border-t border-white/10 text-center bg-white/[0.01]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CLOSING BALANCE</p>
              <p className={`text-3xl font-extrabold font-mono ${(ledgerEntries.length > 0 && ledgerEntries[ledgerEntries.length - 1].balance < 0) ? 'text-red-400' : 'text-green-400'}`}>
                {formatMoney(ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card bg-surface w-full max-w-md p-8 relative border border-white/10">
            <button onClick={() => setIsUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-6 text-white">Create New User</h2>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <button type="submit" className="mt-4 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90">Create User</button>
            </form>
          </div>
        </div>
      )}

      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card bg-surface w-full max-w-md p-8 relative border border-white/10">
            <button onClick={() => setIsEditUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-6 text-white">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              <button type="submit" className="mt-4 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card bg-surface w-full max-w-md p-8 relative border border-red-500/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Delete User?</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>? This will also permanently delete all invoices and payments associated with this user. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all">Cancel</button>
              <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card bg-surface w-full max-w-md p-8 relative border border-white/10">
            <button onClick={() => setIsTransactionModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-2 text-white">{transactionType === 'INVOICE' ? 'Create Invoice' : 'Record Payment'}</h2>
            <form onSubmit={handleTransaction} className="flex flex-col gap-4 mt-6">
              
              <select required value={selectedTxUser} onChange={e => handleTxUserChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white appearance-none">
                <option value="" disabled>Select User</option>
                {users.filter(u => u.role !== 'ADMIN').map(user => (
                  <option key={user.id} value={user.id} className="bg-[#1e1e1e] text-white">{user.name} ({user.email})</option>
                ))}
              </select>

              {transactionType === 'PAYMENT' && selectedTxUser && (
                <div className="text-sm font-bold text-gray-400 mb-2">
                  Remaining Payable Amount: <span className="text-white font-mono">{formatMoney(selectedUserBalance)}</span>
                </div>
              )}

              <input required placeholder="Description (e.g., Services rendered)" value={txData.description} onChange={e => setTxData({...txData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
              
              <input 
                required 
                type="number" 
                step="0.01" 
                min="0.01"
                max={transactionType === 'PAYMENT' ? (selectedUserBalance > 0 ? selectedUserBalance : 0) : undefined}
                placeholder={`Amount (₹)${transactionType === 'PAYMENT' && selectedTxUser ? ` - Max: ${selectedUserBalance}` : ''}`} 
                value={txData.amount} 
                onChange={e => setTxData({...txData, amount: e.target.value})} 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono" 
              />
              
              <button type="submit" className={`mt-4 py-3 rounded-xl font-bold text-white ${transactionType === 'INVOICE' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {transactionType === 'INVOICE' ? 'Issue Invoice (Debit)' : 'Record Payment (Credit)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
