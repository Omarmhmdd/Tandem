import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../api/queries/notifications';
import type { Notification } from '../types/notification.types';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [], isLoading } = useNotifications(false);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter(n => !n.read_at).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    // Always delete the notification when clicked (since we delete instead of marking as read)
    await markAsRead.mutateAsync(notification.id);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead.mutateAsync();
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#53389E] hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-200"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#53389E] hover:text-[#462d85] font-medium"
                disabled={markAllAsRead.isPending}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at;
                  const data = notification.data as { 
                    habit_name?: string; 
                    message?: string;
                    recipe_name?: string;
                    invited_by_name?: string;
                  };
                  
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        isUnread ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          isUnread ? 'bg-[#53389E]' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {data.message || data.habit_name || data.recipe_name || 'Notification'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

