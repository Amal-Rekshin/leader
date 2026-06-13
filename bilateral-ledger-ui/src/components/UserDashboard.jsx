import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { ledgerApi } from '../api/ledgerApi';
import { useToast } from '../context/ToastContext';

const formatMoney = (val) => `₹ ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const UserDashboard = ({ onLogout }) => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0
  });
  const userName = localStorage.getItem('userName') || 'User';

  const { showToast } = useToast();

  const fetchMyLedger = async () => {
    try {
      const res = await ledgerApi.getMyLedger();
      if (res.data && res.data.success) {
        setLedgerEntries(res.data.ledger);
        setDashboardData({
          totalDebit: res.data.totalDebit,
          totalCredit: res.data.totalCredit,
          currentBalance: res.data.currentBalance
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load your ledger data', 'error');
    }
  };

  useEffect(() => {
    fetchMyLedger();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 md:p-10 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {userName}</h1>
          <p className="text-gray-400 text-sm mt-1">View your personal ledger and transactions</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-col flex-1 h-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your Ledger Statement</h2>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="glass-card p-5 md:p-6 border border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">AMOUNT TO BE PAID</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-white">
              {formatMoney(dashboardData.currentBalance)}
            </p>
          </div>
          <div className="glass-card p-5 md:p-6 border border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">TOTAL PAYMENTS MADE</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-green-400">
              {formatMoney(dashboardData.totalCredit)}
            </p>
          </div>
          <div className="glass-card p-5 md:p-6 border border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">TOTAL INVOICED</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-red-400">
              {formatMoney(dashboardData.totalDebit)}
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
              <p className="text-gray-500 font-semibold text-sm">No transactions found for your account.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-w-[768px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                    <th className="p-5">DATE</th>
                    <th className="p-5">DESCRIPTION</th>
                    <th className="p-5 text-right">DEBIT (INVOICE)</th>
                    <th className="p-5 text-right">CREDIT (PAYMENT)</th>
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
            <p className={`text-3xl font-extrabold font-mono ${(dashboardData.currentBalance < 0) ? 'text-green-400' : 'text-red-400'}`}>
              {formatMoney(dashboardData.currentBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
