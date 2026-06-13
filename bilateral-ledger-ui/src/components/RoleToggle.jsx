import React from 'react';
import { motion } from 'framer-motion';

const RoleToggle = ({ activeRole, onToggle }) => {
  return (
    <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-64 relative">
      <motion.div
        className="absolute inset-y-1 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20"
        initial={false}
        animate={{
          left: activeRole === 'VENDOR' ? '4px' : 'calc(50% + 4px)',
          width: 'calc(50% - 8px)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <button
        onClick={() => onToggle('VENDOR')}
        className={`flex-1 py-1.5 text-sm font-medium z-10 transition-colors ${
          activeRole === 'VENDOR' ? 'text-white' : 'text-gray-400'
        }`}
      >
        Vendor
      </button>
      <button
        onClick={() => onToggle('CLIENT')}
        className={`flex-1 py-1.5 text-sm font-medium z-10 transition-colors ${
          activeRole === 'CLIENT' ? 'text-white' : 'text-gray-400'
        }`}
      >
        Client
      </button>
    </div>
  );
};

export default RoleToggle;
