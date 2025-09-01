import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  DollarSign,
  MessageSquare,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Activity,
  CreditCard,
  Package,
  ShoppingCart,
  MapPin,
  Calendar,
  Bell,
  Gift,
  Clock,
  Images
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserPaymentDashboard from './UserPaymentDashboard';
import PaymentManagement from './PaymentManagement';
import SimplePaymentTracker from './SimplePaymentTracker';
import MerchandiseManagement from './MerchandiseManagement';
import OrderManagement from './OrderManagement';
import SportsManagement from './SportsManagement';
import LocationManagement from './LocationManagement';
import BatchManagement from './BatchManagement';
import UserManagement from './UserManagement';
import CoachAssignments from './CoachAssignments';
import ManualEnrollment from './ManualEnrollment';
import UserAnalyticsDashboard from './UserAnalyticsDashboard';
import NotificationManagement from './NotificationManagement';
import TicketManagement from './TicketManagement';
import ReferralManagement from './ReferralManagement';
import SessionManagement from './SessionManagement';
import CarouselManagement from './CarouselManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface ProfessionalAdminDashboardProps {
  onLogout: () => void;
}

const ProfessionalAdminDashboard = ({ onLogout }: ProfessionalAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Real-time data queries
  const allUsers = useQuery(api.users.getAllUsers) || [];
  const enrollmentStats = useQuery(api.userEnrollments.getEnrollmentStatistics) || {
    totalRevenue: 0,
    activeEnrollments: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    cancelledEnrollments: 0,
    paidEnrollments: 0,
    averageSessionsAttended: 0
  };
  const testimonials = useQuery(api.testimonials.getAllTestimonials) || [];
  const recentActivities = useQuery(api.userActivities.getRecentActivities, { limit: 10 }) || [];
  
  // Calculate real stats from data
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(user => user.status === 'active').length;
  const totalRevenue = enrollmentStats.totalRevenue || 0;
  const activeSessions = enrollmentStats.activeEnrollments || 0;
  
  const stats = [
    { title: 'Total Users', value: totalUsers.toLocaleString(), change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+8%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Active Sessions', value: activeSessions.toLocaleString(), change: '+23%', icon: Activity, color: 'text-purple-600' },
    { title: 'Active Users', value: activeUsers.toLocaleString(), change: '+5%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  // Get recent users for display
  const recentUsers = allUsers.slice(0, 10).map(user => ({
    id: user._id,
    name: user.name || user.fullName || 'Unknown',
    email: user.email || 'No email',
    sport: 'Multiple', // Since users can enroll in multiple sports
    status: user.status === 'active' ? 'Active' : 'Inactive',
    plan: user.userType || 'Student'
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'payments', label: 'User Payments', icon: CreditCard },
    { id: 'payment-tracking', label: 'Payment Tracking', icon: DollarSign },
    { id: 'simple-payment-tracker', label: 'Payment Tracker', icon: DollarSign },
    { id: 'manual-enrollment', label: 'Manual Enrollment', icon: Plus },
    { id: 'sports', label: 'Sports Programs', icon: Activity },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'batches', label: 'Batches', icon: Calendar },
    { id: 'coaches', label: 'Coaches', icon: Users },
    { id: 'merchandise', label: 'Merchandise', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'sessions', label: 'Session Management', icon: Clock },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'carousel', label: 'Carousel', icon: Images },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user activities and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent activities
              </div>
            ) : (
              recentActivities.map((activity, index) => {
                const timeAgo = new Date(activity.timestamp).toLocaleString();
                return (
                  <div key={activity._id || index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.activityType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.activityDetails?.description || `User: ${activity.userId}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.sport}</Badge>
                  </TableCell>
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Manage homepage hero content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Enter hero title" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="Enter hero description" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>Manage subscription plans and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Basic', 'Pro', 'Elite'].map((plan) => (
              <div key={plan} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{plan} Plan</h3>
                <p className="text-2xl font-bold">₹2,999</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Edit Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTestimonials = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>Manage customer testimonials</CardDescription>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No testimonials found
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{testimonial.comment}</p>
                    <div className="flex mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sport: {testimonial.sport}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Site Name</label>
            <Input defaultValue="Playgram Sports" />
          </div>
          <div>
            <label className="text-sm font-medium">Contact Email</label>
            <Input defaultValue="contact@playgram.com" />
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Google Analytics configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Measurement ID</label>
            <Input defaultValue="G-ETJFCXYJWY" readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Stream ID</label>
            <Input defaultValue="11508273791" readOnly />
          </div>
          <Button variant="outline">Test Connection</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'analytics': return <UserAnalyticsDashboard />;
      case 'payments': return <UserPaymentDashboard />;
      case 'payment-tracking': return <PaymentManagement />;
      case 'simple-payment-tracker': return <SimplePaymentTracker />;
      case 'manual-enrollment': return <ManualEnrollment />;
      case 'sports': return <SportsManagement />;
      case 'locations': return <LocationManagement />;
      case 'batches': return <BatchManagement />;
      case 'coaches': return <CoachAssignments />;
      case 'merchandise': return <MerchandiseManagement />;
      case 'orders': return <OrderManagement />;
      case 'users': return <UserManagement />;
      case 'notifications': return <NotificationManagement />;
      case 'tickets': return <TicketManagement />;
      case 'content': return renderContent();
      case 'carousel': return <CarouselManagement />;
      case 'testimonials': return renderTestimonials();
      case 'referrals': return <ReferralManagement />;
      case 'sessions': return <SessionManagement />;
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <div className="flex items-center space-x-4">
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_6671-removebg-preview.png"
              alt="Playgram Logo"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-lg font-semibold">Playgram Admin</h1>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-3.5rem)]">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalAdminDashboard;