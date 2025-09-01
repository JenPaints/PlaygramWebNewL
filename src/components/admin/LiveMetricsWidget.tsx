import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Eye, DollarSign, Clock } from 'lucide-react';

interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveMetrics {
  activeUsers: MetricData;
  pageViews: MetricData;
  revenue: MetricData;
  avgSessionTime: MetricData;
}

const LiveMetricsWidget = () => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeUsers: { value: 89, change: 12.5, trend: 'up' },
    pageViews: { value: 3456, change: 8.3, trend: 'up' },
    revenue: { value: 245678, change: -2.1, trend: 'down' },
    avgSessionTime: { value: 245, change: 15.7, trend: 'up' }
  });

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: {
          ...prev.activeUsers,
          value: Math.max(50, prev.activeUsers.value + Math.floor(Math.random() * 10 - 5)),
          change: (Math.random() - 0.5) * 20,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        pageViews: {
          ...prev.pageViews,
          value: prev.pageViews.value + Math.floor(Math.random() * 20 + 5),
          change: Math.random() * 15 + 5,
          trend: 'up'
        },
        revenue: {
          ...prev.revenue,
          value: prev.revenue.value + Math.floor(Math.random() * 1000 - 500),
          change: (Math.random() - 0.5) * 10,
          trend: Math.random() > 0.3 ? 'up' : 'down'
        },
        avgSessionTime: {
          ...prev.avgSessionTime,
          value: Math.max(120, prev.avgSessionTime.value + Math.floor(Math.random() * 20 - 10)),
          change: (Math.random() - 0.5) * 25,
          trend: Math.random() > 0.4 ? 'up' : 'down'
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    formatter = (v: number) => v.toLocaleString(),
    color = 'blue'
  }: {
    title: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    icon: any;
    formatter?: (value: number) => string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700',
      orange: 'from-orange-600 to-orange-700'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-6 text-white relative overflow-hidden`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <motion.p 
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold mt-1"
            >
              {formatter(value)}
            </motion.p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-300 mr-1" />
              ) : null}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-300' : 
                trend === 'down' ? 'text-red-300' : 'text-white/60'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          </div>
          <Icon className="w-8 h-8 text-white/60" />
        </div>
        
        {/* Animated background pulse */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-white/10 rounded-xl"
        />
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers.value}
        change={metrics.activeUsers.change}
        trend={metrics.activeUsers.trend}
        icon={Users}
        color="blue"
      />
      
      <MetricCard
        title="Page Views"
        value={metrics.pageViews.value}
        change={metrics.pageViews.change}
        trend={metrics.pageViews.trend}
        icon={Eye}
        color="green"
      />
      
      <MetricCard
        title="Revenue"
        value={metrics.revenue.value}
        change={metrics.revenue.change}
        trend={metrics.revenue.trend}
        icon={DollarSign}
        formatter={formatCurrency}
        color="purple"
      />
      
      <MetricCard
        title="Avg Session"
        value={metrics.avgSessionTime.value}
        change={metrics.avgSessionTime.change}
        trend={metrics.avgSessionTime.trend}
        icon={Clock}
        formatter={formatTime}
        color="orange"
      />
    </div>
  );
};

export default LiveMetricsWidget;