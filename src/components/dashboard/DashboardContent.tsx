import React, { useEffect, useRef } from 'react';
import { DashboardView } from './Dashboard';
import { DashboardOverview } from './views/DashboardOverview';
import { CoachingView } from './views/CoachingView';
import { BatchesView } from './views/BatchesView';
import { MerchandiseView } from './views/MerchandiseView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { SupportView } from './views/SupportView';
import { ProfileView } from './views/ProfileView';
import StudentReferralView from './StudentReferralView';
import TransactionDetailsView from './views/OrdersView';

interface DashboardContentProps {
    currentView: DashboardView;
    user: any;
    enrollments: any[];
    trialBookings: any[];
    setCurrentView: (view: DashboardView) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
    currentView,
    user,
    enrollments,
    trialBookings,
    setCurrentView
}) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // Scroll to top whenever the view changes
    useEffect(() => {
        if (contentRef.current) {
            // Smooth scroll to top
            contentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Also scroll the window/document to top as fallback
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('📱 Scrolled to top for view:', currentView);
    }, [currentView]);

    const renderView = () => {
        switch (currentView) {
            case 'overview':
                return <DashboardOverview user={user} enrollments={enrollments} trialBookings={trialBookings} setCurrentView={setCurrentView} />;
            case 'coaching':
                return <CoachingView enrollments={enrollments} trialBookings={trialBookings} setCurrentView={setCurrentView} />;
            case 'batches':
                return <BatchesView enrollments={enrollments} setCurrentView={setCurrentView} />;
            case 'merchandise':
                return <MerchandiseView currentView={currentView} />;
            case 'orders':
                return <TransactionDetailsView />;
            case 'notifications':
                return <NotificationsView />;
            case 'settings':
                return <SettingsView user={user} />;
            case 'support':
                return <SupportView />;
            case 'referrals':
                return <StudentReferralView />;
            case 'profile':
                return <ProfileView user={user} />;
            default:
                return <DashboardOverview user={user} enrollments={enrollments} trialBookings={trialBookings} />;
        }
    };

    return (
        <div ref={contentRef} className="min-h-screen bg-gray-50">
            {renderView()}
        </div>
    );
};