import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

interface DataPoint {
  timestamp: number;
  value: number;
}

const RealTimeChart = () => {
  const [data, setData] = useState<DataPoint[]>([
    { timestamp: Date.now() - 300000, value: 65 },
    { timestamp: Date.now() - 240000, value: 78 },
    { timestamp: Date.now() - 180000, value: 82 },
    { timestamp: Date.now() - 120000, value: 95 },
    { timestamp: Date.now() - 60000, value: 88 },
    { timestamp: Date.now(), value: 92 }
  ]);

  const [currentValue, setCurrentValue] = useState(92);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.max(30, Math.min(100, currentValue + (Math.random() - 0.5) * 20));
      const newDataPoint = {
        timestamp: Date.now(),
        value: newValue
      };

      setData(prev => [...prev.slice(-19), newDataPoint]); // Keep last 20 points
      setCurrentValue(newValue);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentValue]);

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Real-Time Analytics</h3>
          <p className="text-gray-400 text-sm">Live user activity tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{currentValue.toFixed(0)}</p>
            <p className="text-gray-400 text-sm">Current Value</p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 bg-gray-800/30 rounded-xl p-4 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart Line */}
          <motion.path
            d={`M ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 200 - ((point.value - minValue) / range) * 180;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D7243F" />
              <stop offset="100%" stopColor="#89D3EC" />
            </linearGradient>
          </defs>

          {/* Data Points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 800;
            const y = 200 - ((point.value - minValue) / range) * 180;
            
            return (
              <motion.circle
                key={point.timestamp}
                cx={x}
                cy={y}
                r="4"
                fill="#89D3EC"
                stroke="#fff"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="drop-shadow-lg"
              />
            );
          })}

          {/* Area Fill */}
          <motion.path
            d={`M ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = 200 - ((point.value - minValue) / range) * 180;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')} L 800 200 L 0 200 Z`}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#89D3EC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D7243F" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Time Labels */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
          <span>{formatTime(data[0]?.timestamp)}</span>
          <span>{formatTime(data[Math.floor(data.length / 2)]?.timestamp)}</span>
          <span>{formatTime(data[data.length - 1]?.timestamp)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{maxValue.toFixed(0)}</p>
          <p className="text-gray-400 text-sm">Peak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#89D3EC]">
            {(data.reduce((acc, d) => acc + d.value, 0) / data.length).toFixed(0)}
          </p>
          <p className="text-gray-400 text-sm">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">{minValue.toFixed(0)}</p>
          <p className="text-gray-400 text-sm">Low</p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;