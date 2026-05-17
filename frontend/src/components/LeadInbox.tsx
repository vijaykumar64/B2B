import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { User, ChatRoom } from '../types';
import { MessageSquare, Building2, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatWindow from './ChatWindow';

interface LeadInboxProps {
  user: User;
  initialChatId?: string | null;
}

export default function LeadInbox({ user, initialChatId }: LeadInboxProps) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const fetchChats = async () => {
      try {
        const data = await api.get('/conversations');
        const chatList: ChatRoom[] = data.conversations || data || [];
        chatList.sort((a, b) => {
          const aTime = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
          const bTime = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
          return bTime - aTime;
        });
        setChats(chatList);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    const socket = getSocket();
    socket.on('conversations:updated', fetchChats);
    return () => { socket.off('conversations:updated', fetchChats); };
  }, [user?.id]);

  useEffect(() => {
    if (initialChatId) setSelectedChatId(initialChatId);
  }, [initialChatId]);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const filteredChats = chats.filter(c => {
    const name = user.role === 'brand_owner' ? c.investorName : c.brandName;
    return name?.toLowerCase().includes(search.toLowerCase()) ||
      c.opportunityName?.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount?.[user.id] || 0), 0);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* ── Sidebar ── */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-100`}>

        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-black text-white tracking-tight">Messages</h2>
            {totalUnread > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{totalUnread}</span>
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
          </p>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-medium placeholder:text-slate-500 outline-none focus:border-white/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-grow overflow-y-auto no-scrollbar bg-white">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="h-5 w-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-xs font-medium text-slate-400">
                {search ? 'No results found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredChats.map((chat) => {
                const isSelected = selectedChatId === chat.id;
                const otherPartyName = user.role === 'brand_owner' ? chat.investorName : chat.brandName;
                const unread = chat.unreadCount?.[user.id] || 0;
                const initials = (otherPartyName || 'U').substring(0, 2).toUpperCase();

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full text-left p-4 transition-all relative group ${
                      isSelected
                        ? 'bg-slate-900 border-l-4 border-orange-500'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}>
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {otherPartyName}
                          </span>
                          {chat.lastMessageTimestamp && (
                            <span className={`text-[9px] font-bold whitespace-nowrap shrink-0 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                              {formatDistanceToNow(new Date(chat.lastMessageTimestamp), { addSuffix: false })}
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center gap-1 text-[10px] font-medium mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                          <Building2 className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{chat.opportunityName}</span>
                        </div>

                        <p className={`text-xs mt-1.5 truncate ${
                          unread > 0
                            ? 'font-bold text-slate-900'
                            : isSelected ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'
                        }`}>
                          {chat.lastMessage || 'Start a conversation'}
                        </p>
                      </div>

                      {unread > 0 && (
                        <div className="h-5 min-w-[20px] px-1.5 bg-orange-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-[9px] font-black text-white">{unread}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className={`${selectedChatId ? 'flex' : 'hidden md:flex'} flex-grow flex-col bg-slate-50/30`}>
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            user={user}
            onClose={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
            <div className="max-w-sm space-y-6">
              <div className="relative mx-auto w-fit">
                <div className="h-20 w-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <MessageSquare className="h-9 w-9 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Your Message Hub</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Select a conversation from the sidebar to start discussing business opportunities.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left space-y-2 shadow-sm">
                  <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Rate</p>
                  <p className="text-xs font-bold text-slate-900">Track Speed</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left space-y-2 shadow-sm">
                  <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Connect</p>
                  <p className="text-xs font-bold text-slate-900">Verified Brands</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
