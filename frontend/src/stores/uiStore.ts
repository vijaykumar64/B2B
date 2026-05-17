import { create } from 'zustand';
import type { Opportunity } from '../types';

interface UIStore {
  // Auth modal
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  authInitialRole: 'investor' | 'brand_owner';
  openAuthModal: (mode?: 'login' | 'signup', role?: 'investor' | 'brand_owner') => void;
  closeAuthModal: () => void;

  // Feedback modal
  isFeedbackModalOpen: boolean;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;

  // Call request modal
  isCallModalOpen: boolean;
  callModalType: 'investor' | 'brand';
  openCallModal: (type?: 'investor' | 'brand') => void;
  closeCallModal: () => void;

  // Complete profile modal
  isCompleteProfileOpen: boolean;
  openCompleteProfile: () => void;
  closeCompleteProfile: () => void;

  // Custom questions modal (apply flow)
  isQuestionsModalOpen: boolean;
  selectedOpportunity: Opportunity | null;
  openQuestionsModal: (opportunity: Opportunity) => void;
  closeQuestionsModal: () => void;

  // Unread messages badge
  unreadMessagesCount: number;
  setUnreadMessagesCount: (count: number) => void;

  // Sidebar state (persists across navigations)
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isAuthModalOpen: false,
  authMode: 'signup',
  authInitialRole: 'investor',
  openAuthModal: (mode = 'signup', role = 'investor') => set({ isAuthModalOpen: true, authMode: mode, authInitialRole: role }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  isFeedbackModalOpen: false,
  openFeedbackModal: () => set({ isFeedbackModalOpen: true }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),

  isCallModalOpen: false,
  callModalType: 'investor',
  openCallModal: (type = 'investor') => set({ isCallModalOpen: true, callModalType: type }),
  closeCallModal: () => set({ isCallModalOpen: false }),

  isCompleteProfileOpen: false,
  openCompleteProfile: () => set({ isCompleteProfileOpen: true }),
  closeCompleteProfile: () => set({ isCompleteProfileOpen: false }),

  isQuestionsModalOpen: false,
  selectedOpportunity: null,
  openQuestionsModal: (opportunity) => set({ isQuestionsModalOpen: true, selectedOpportunity: opportunity }),
  closeQuestionsModal: () => set({ isQuestionsModalOpen: false, selectedOpportunity: null }),

  unreadMessagesCount: 0,
  setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}));
