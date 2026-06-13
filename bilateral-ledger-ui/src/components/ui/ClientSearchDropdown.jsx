import React, { useState, useEffect } from 'react';
import { ledgerApi } from '../../api/ledgerApi';
import { Loader2, Search } from 'lucide-react';

/**
 * Searchable dropdown for selecting a client (or vendor) by email/name.
 * Fetches the full client list once on mount and filters locally as the user types.
 * Minimum one character triggers the suggestions list.
 */
const ClientSearchDropdown = ({ role, onSelect, placeholder = 'Search client…' }) => {
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchMatches = async (searchText) => {
    if (searchText.trim().length < 1) {
      setFiltered([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await ledgerApi.getClients(role);
      const list = res.data || [];
      setClients(list);
      const lowered = searchText.toLowerCase();
      setFiltered(list.filter(c =>
        (c.name && c.name.toLowerCase().includes(lowered)) ||
        (c.email && c.email.toLowerCase().includes(lowered))
      ));
      setOpen(true);
    } catch (e) {
      console.error('Failed to fetch client list', e);
    }
    setLoading(false);
  };

  // Debounce filter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 1) {
        if (clients.length > 0) {
          const lowered = query.toLowerCase();
          setFiltered(clients.filter(c =>
            (c.name && c.name.toLowerCase().includes(lowered)) ||
            (c.email && c.email.toLowerCase().includes(lowered))
          ));
          setOpen(true);
        } else {
          fetchMatches(query);
        }
      } else {
        setFiltered([]);
        setOpen(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query, clients]);

  const handleSelect = (client) => {
    onSelect(client);
    setQuery(client.name || client.email);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          required
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-4 focus:outline-none focus:border-primary/50 text-white"
        />
        <button
          type="button"
          onClick={() => fetchMatches(query)}
          disabled={loading || query.trim().length < 1}
          className="h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-xl bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Search"
          aria-label="Search"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-surface border border-white/10 rounded-xl mt-1 max-h-60 overflow-y-auto">
          {filtered.map(c => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className="px-4 py-2 hover:bg-white/5 cursor-pointer flex justify-between"
            >
              <span>{c.name}</span>
              <span className="text-xs text-gray-400">{c.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSearchDropdown;
