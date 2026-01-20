import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 relative flex flex-col min-w-0">
                {/* Content Container - adaptable width */}
                <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Layout;
