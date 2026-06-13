import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, trend, icon: Icon }) => (
  <div className="glass-card glass-card-hover p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Icon size={24} />
      </div>
      <span className={`text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
  </div>
);

export default MetricCard;
