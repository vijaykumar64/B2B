import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  Calendar,
  MoreVertical,
  Check,
  X,
  BellOff
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AppNotification, User } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../lib/notifications';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  user: User | null;
}

export default function NotificationCenter({ user }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.id || user.isDemo) return;

    const fetchNotifications = async () => {
      try {
        const data = await api.get('/notifications');
        setNotifications(data.notifications || data || []);
      } catch (_) {}
    };

    fetchNotifications();

    const socket = getSocket();
    socket.on('notifications:new', fetchNotifications);

    return () => {
      socket.off('notifications:new', fetchNotifications);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reminder': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'application': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'update': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <div className="relative h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm group cursor-pointer">
          <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-[10px] font-black rounded-lg border-2 border-white flex items-center justify-center pointer-events-none">
              {unreadCount}
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Notifications
            </DialogTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-white hover:bg-white/10"
                onClick={() => user && markAllNotificationsAsRead(user.id, notifications)}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                <BellOff className="h-8 w-8 text-slate-200" />
              </div>
              <div>
                <p className="font-bold text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Check back later for reminders and updates.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-orange-50/30' : ''}`}
                    onClick={() => {
                      if (!n.read) markNotificationAsRead(n.id);
                    }}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600" />
                    )}
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${
                        n.type === 'reminder' ? 'bg-orange-100 text-orange-600' :
                        n.type === 'application' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-bold text-slate-900 leading-tight">{n.title}</p>
                          <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">
                            {new Date(n.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2">{n.message}</p>
                        
                        {n.actionRequired && !n.read && (
                          <div className="pt-2 flex items-center gap-2">
                            <Badge className="bg-orange-600 h-5 px-2 text-[8px] font-black uppercase tracking-widest rounded-md">Action Required</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              View Tracking History
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
