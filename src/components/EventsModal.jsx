import React from 'react';
import { X } from 'lucide-react';
import EventCountdown from './EventCountdown';

const EventsModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full bg-white transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-1 overflow-y-auto custom-scrollbar">
                    <EventCountdown />
                </div>
            </div>
        </div>
    );
};

export default EventsModal;
