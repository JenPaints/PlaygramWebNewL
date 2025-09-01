import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  icon: any;
  threshold: { warning: number; critical: number };
}

const SystemHealthMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45,
      status: 'healthy',
      unit: '%',
      icon: Cpu,
      threshold: { warning: 70, critical: 90 }
    },
    {
      name: 'Memory Usage',
      value: 62,
      status: 'healthy',
      unit: '%',
      icon: HardDrive,
      threshold: { warning: 80, critical: 95 }
    },
    {
      name: 'Database Load',
      value: 38,
      status: 'healthy',
      unit: '%',
      icon: Database,
      threshold: { warning: 75, critical: 90 }
    },
    {
      name: 'Network Latency',
      value: 45,
      status: 'healthy',
      unit: 'ms',
      icon: Wifi,
      threshold: { warning: 100, critical: 200 }
    },
    {
      name: 'Server Response',
      value: 120,
      status: 'healthy',
      unit: 'ms',
      icon: Server,
      threshold: { warning: 500, critical: 1000 }
    },
    {
      name: 'Active Connections',
      value: 234,
      status: 'healthy',
      unit: '',
      icon: Activity,
      threshold: { warning: 500, critical: 800 }
    }
  ]);

  const [uptime, setUptime] = useState(99.98);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simulate real-time system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 10;
        
        // Keep values within realistic bounds
        if (metric.unit === '%') {
          newValue = Math.max(0, Math.min(100, newValue));
        } else if (metric.name === 'Network Latency') {
          newValue = Math.max(20, Math.min(300, newValue));
        } else if (metric.name === 'Server Response') {
          newValue = Math.max(50, Math.min(2000, newValue));
        } else if (metric.name === 'Active Connections') {
          newValue = Math.max(100, Math.min(1000, newValue));
        }

        // Determine status based on thresholds
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (newValue >= metric.threshold.critical) {
          status = 'critical';
        } else if (newValue >= metric.threshold.warning) {
          status = 'warning';
        }

        return {
          ...metric,
          value: Math.round(newValue),
          status
        };
      }));

      // Update uptime (slight variations)
      setUptime(prev => Math.max(99.5, Math.min(100, prev + (Math.random() - 0.5) * 0.01)));
      setLastUpdate(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-400/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'critical':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const overallStatus = metrics.some(m => m.status === 'critical') ? 'critical' :
                       metrics.some(m => m.status === 'warning') ? 'warning' : 'healthy';

  const formatLastUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">System Health Monitor</h3>
          <p className="text-gray-400 text-sm">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">{uptime.toFixed(2)}%</p>
            <p className="text-gray-400 text-sm">Uptime</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(overallStatus)}`}>
            {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-[#89D3EC]" />
                  <span className="text-white font-medium text-sm">{metric.name}</span>
                </div>
                {getStatusIcon(metric.status)}
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}{metric.unit}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: metric.unit === '%' ? `${metric.value}%` : 
                               metric.name === 'Network Latency' ? `${(metric.value / 300) * 100}%` :
                               metric.name === 'Server Response' ? `${(metric.value / 2000) * 100}%` :
                               metric.name === 'Active Connections' ? `${(metric.value / 1000) * 100}%` : '50%'
                      }}
                      className={`h-2 rounded-full transition-colors ${
                        metric.status === 'healthy' ? 'bg-green-400' :
                        metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="bg-gray-800/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">
                {metrics.filter(m => m.status === 'healthy').length} Healthy
              </span>
            </div>
            {metrics.filter(m => m.status === 'warning').length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 text-sm">
                  {metrics.filter(m => m.status === 'warning').length} Warning
                </span>
              </div>
            )}
            {metrics.filter(m => m.status === 'critical').length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-red-400 text-sm">
                  {metrics.filter(m => m.status === 'critical').length} Critical
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Updated {formatLastUpdate()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;