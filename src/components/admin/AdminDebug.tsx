import { useEffect, useState } from 'react';
import { useAdminDashboard } from '../../hooks/useRealTimeData';
import { analytics } from '../../services/analytics';

const AdminDebug = () => {
    const [debugInfo, setDebugInfo] = useState<any>({});

    try {
        const { metrics, users, activities, isLoading, actions } = useAdminDashboard();

        useEffect(() => {
            setDebugInfo({
                metrics,
                usersCount: users.length,
                activitiesCount: activities.length,
                isLoading,
                timestamp: new Date().toISOString()
            });

            console.log('AdminDebug - Real-time data:', {
                metrics,
                users: users.length,
                activities: activities.length,
                isLoading
            });
        }, [metrics, users, activities, isLoading]);

        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <h1 className="text-3xl font-bold mb-8">Admin Debug Panel</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Real-time Data Status</h2>
                        <pre className="text-sm text-green-400 whitespace-pre-wrap">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Analytics Test</h2>
                        <button
                            onClick={() => {
                                analytics.trackEvent('debug_test', {
                                    timestamp: Date.now(),
                                    test: 'admin_debug'
                                });
                                console.log('Analytics test event sent');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
                        >
                            Test Analytics
                        </button>

                        <div className="space-y-2">
                            <p>Metrics: {JSON.stringify(metrics)}</p>
                            <p>Users: {users.length}</p>
                            <p>Activities: {activities.length}</p>
                            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Actions Test</h2>
                    <div className="space-x-4">
                        <button
                            onClick={() => {
                                actions.addUser({
                                    name: 'Test User',
                                    email: `test${Date.now()}@example.com`,
                                    sport: 'Football',
                                    status: 'Active',
                                    joinDate: new Date().toISOString().split('T')[0],
                                    plan: 'Basic Plan'
                                });
                            }}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                        >
                            Add Test User
                        </button>

                        <button
                            onClick={actions.refreshMetrics}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                        >
                            Refresh Metrics
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="min-h-screen bg-red-900 text-white p-8">
                <h1 className="text-3xl font-bold mb-8">Error in AdminDebug</h1>
                <pre className="text-red-200">{String(error)}</pre>
            </div>
        );
    }
};

export default AdminDebug;