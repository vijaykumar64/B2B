import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { User, ChatRoom, ChatMessage } from '../types';
import {
  Send, Calendar, PhoneCall, MapPin, CheckCircle2, XCircle,
  ArrowLeft, ShieldCheck, Building2, CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ChatWindowProps {
  chat: ChatRoom;
  user: User;
  onClose: () => void;
}

export default function ChatWindow({ chat, user, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<User | null>(null);
  const [opportunityData, setOpportunityData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.role === 'brand_owner' && chat.investor_uid) {
      api.get(`/users/${chat.investor_uid}`).then(d => { if (d.user) setInvestorProfile(d.user); }).catch(() => {});
    } else if (user.role === 'investor' && chat.opportunityId) {
      api.get(`/opportunities/${chat.opportunityId}`).then(d => { if (d.opportunity) setOpportunityData(d.opportunity); }).catch(() => {});
    }
  }, [user.role, chat.investor_uid, chat.opportunityId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get(`/conversations/${chat.id}/messages`);
        setMessages(data.messages || data || []);
      } catch (_) {}
    };
    fetchMessages();

    if (chat.unreadCount?.[user.id] > 0) {
      api.patch(`/conversations/${chat.id}`, { clearUnread: true }).catch(() => {});
    }

    const socket = getSocket();
    const handleNew = (msg: ChatMessage) => {
      if (msg.chatId === chat.id) setMessages(prev => [...prev, msg]);
    };
    socket.on('messages:new', handleNew);
    return () => { socket.off('messages:new', handleNew); };
  }, [chat.id, user.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await api.post(`/conversations/${chat.id}/messages`, { text, type: 'text' });
    } catch { toast.error('Failed to send message'); }
  };

  const scheduleMeeting = async (details: any) => {
    try {
      await api.post(`/conversations/${chat.id}/messages`, {
        text: `Proposing a ${details.type.replace('_', ' ')} for ${details.date} at ${details.time}`,
        type: 'meeting_invite',
        meetingDetails: { ...details, status: 'pending' }
      });
      setIsScheduling(false);
      toast.success('Meeting proposal sent');
    } catch { toast.error('Failed to schedule meeting'); }
  };

  const updateMeetingStatus = async (messageId: string, status: 'accepted' | 'declined') => {
    try {
      await api.patch(`/conversations/${chat.id}/messages/${messageId}`, { 'meetingDetails.status': status });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, meetingDetails: { ...m.meetingDetails!, status } } : m));
      toast.success(`Meeting ${status}`);
    } catch { toast.error('Failed to update meeting'); }
  };

  const otherPartyName = user.role === 'brand_owner' ? chat.investorName : chat.brandName;
  const initials = (otherPartyName || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* ── Header ── */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="md:hidden h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xs shrink-0">
            {initials}
          </div>

          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              {otherPartyName}
              <ShieldCheck className="h-3 w-3 text-orange-400" />
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <Building2 className="h-2.5 w-2.5" />
              <span>{chat.opportunityName}</span>
              <span className="h-1 w-1 rounded-full bg-green-400" />
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'brand_owner' && (
            <>
              <button
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:flex h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all items-center gap-1.5"
              >
                View Profile
              </button>
              <button
                onClick={() => setIsScheduling(true)}
                className="hidden sm:flex h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest transition-all items-center gap-1.5"
              >
                <CalendarDays className="h-3 w-3" />
                Schedule
              </button>
            </>
          )}
          {user.role === 'investor' && (
            <button
              onClick={async () => {
                try {
                  await api.post(`/conversations/${chat.id}/messages`, { text: 'Requesting a priority call back.', type: 'text' });
                  toast.success('Call back requested!');
                } catch { toast.error('Failed to request call back'); }
              }}
              className="hidden sm:flex h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all items-center gap-1.5"
            >
              <PhoneCall className="h-3 w-3" />
              Call Back
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-4 bg-slate-50 no-scrollbar">

        {/* Secure notice */}
        <div className="max-w-xs mx-auto text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <ShieldCheck className="h-3 w-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Conversation</span>
          </div>
        </div>

        {messages.map((msg) => {
          const isOwn = msg.senderId === user.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] space-y-1 flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {msg.type === 'text' ? (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    isOwn
                      ? 'bg-slate-900 text-white rounded-tr-sm'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                ) : (
                  /* Meeting invite card */
                  <div className={`rounded-2xl overflow-hidden border shadow-sm min-w-[260px] ${
                    isOwn ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                  }`}>
                    {/* Card header */}
                    <div className="bg-orange-500 px-4 py-2.5 flex items-center gap-2">
                      {msg.meetingDetails?.type === 'phone_call'
                        ? <PhoneCall className="h-3.5 w-3.5 text-white" />
                        : <MapPin className="h-3.5 w-3.5 text-white" />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Meeting Proposal</span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-2.5 rounded-xl ${isOwn ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isOwn ? 'text-slate-400' : 'text-slate-400'}`}>Date</p>
                          <p className={`text-xs font-bold ${isOwn ? 'text-white' : 'text-slate-900'}`}>{msg.meetingDetails?.date}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${isOwn ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isOwn ? 'text-slate-400' : 'text-slate-400'}`}>Time</p>
                          <p className={`text-xs font-bold ${isOwn ? 'text-white' : 'text-slate-900'}`}>{msg.meetingDetails?.time}</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${isOwn ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <MapPin className={`h-3 w-3 shrink-0 ${isOwn ? 'text-slate-400' : 'text-slate-400'}`} />
                        <p className={`text-[11px] font-medium truncate ${isOwn ? 'text-slate-300' : 'text-slate-600'}`}>{msg.meetingDetails?.location}</p>
                      </div>

                      {msg.meetingDetails?.status === 'pending' ? (
                        !isOwn ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateMeetingStatus(msg.id!, 'accepted')}
                              className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateMeetingStatus(msg.id!, 'declined')}
                              className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 animate-pulse">Awaiting Confirmation</p>
                          </div>
                        )
                      ) : (
                        <div className={`p-2 rounded-xl text-center flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                          msg.meetingDetails?.status === 'accepted'
                            ? 'bg-green-50 border border-green-100 text-green-600'
                            : 'bg-red-50 border border-red-100 text-red-500'
                        }`}>
                          {msg.meetingDetails?.status === 'accepted'
                            ? <CheckCircle2 className="h-3 w-3" />
                            : <XCircle className="h-3 w-3" />}
                          {msg.meetingDetails?.status}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Input ── */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            disabled={isScheduling}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isScheduling}
            className="h-11 w-11 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-slate-900/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>

        {/* Schedule Meeting Modal */}
        {isScheduling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Schedule Meeting</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Investor Briefing</p>
                  </div>
                </div>
                <button onClick={() => setIsScheduling(false)} className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                    <select id="meetingType" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                      <option value="phone_call">Phone Call</option>
                      <option value="site_visit">Site Visit</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                    <input type="time" id="meetingTime" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input type="date" id="meetingDate" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / Dial Info</label>
                  <input type="text" id="meetingLocation" placeholder="E.g. Phone Call or Office Address" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>

                <button
                  onClick={() => {
                    const type = (document.getElementById('meetingType') as HTMLSelectElement).value;
                    const date = (document.getElementById('meetingDate') as HTMLInputElement).value;
                    const time = (document.getElementById('meetingTime') as HTMLInputElement).value;
                    const location = (document.getElementById('meetingLocation') as HTMLInputElement).value;
                    if (!date || !time || !location) { toast.error('Please fill all details'); return; }
                    scheduleMeeting({ type, date, time, location });
                  }}
                  className="w-full bg-slate-900 hover:bg-black text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  Propose Meeting
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Investor Profile Modal */}
        {showProfileModal && investorProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-sm">
                    {investorProfile.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{investorProfile.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Investor</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Investment Range', value: investorProfile.investment_range || 'Not Disclosed' },
                    { label: 'Interest Type', value: investorProfile.interestType || 'All' },
                    { label: 'Location', value: investorProfile.location || 'Willing to explore' },
                    { label: 'Top Category', value: investorProfile.interestedCategories?.[0] || 'Any' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-orange-500 shrink-0" />
                  <p className="text-[11px] text-slate-600 font-medium">Contact number is hidden for privacy. Continue chat or schedule a meeting.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
