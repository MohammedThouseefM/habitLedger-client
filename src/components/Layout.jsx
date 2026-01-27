import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-bg text-text">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 relative flex flex-col min-w-0">
                {/* Mobile Header */}
                <MobileHeader />

                {/* Content Container - adaptable width */}
                {/* Content Container - adaptable width */}
                <div className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Layout;
