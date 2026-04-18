import React from 'react';
import { Bell, Info, X } from 'lucide-react';

const AnnouncementBanner = ({ announcements = [] }) => {
  if (announcements.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] w-96 space-y-4">
      {announcements.map((ann, i) => (
        <div key={i} className="bg-white border-l-4 border-status-info p-5 rounded-2xl shadow-2xl animate-slide-up relative group ring-1 ring-black/5">
          <div className="flex items-start space-x-4">
            <div className="bg-status-info/10 p-2 rounded-xl text-status-info">
              <Bell size={20} />
            </div>
            <div className="flex-1 pr-6">
              <h4 className="font-black text-gray-900 text-sm">{ann.title}</h4>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">{ann.message}</p>
              <div className="mt-3 flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <Info size={12} className="mr-1" />
                Posted {new Date(ann.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
