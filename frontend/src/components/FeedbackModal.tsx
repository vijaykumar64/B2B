import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  AlertCircle, 
  Lightbulb, 
  Bug, 
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { User } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

type FeedbackType = 'complaint' | 'suggestion' | 'bug' | 'other';

export default function FeedbackModal({ isOpen, onClose, user }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit feedback");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', {
        userId: user.id,
        userName: user.name || 'Anonymous',
        userEmail: user.email,
        userRole: user.role,
        type,
        subject,
        message,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      setIsSuccess(true);
      toast.success("Thank you! Your feedback has been submitted.");
      setTimeout(() => {
        setIsSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const types = [
    { id: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="h-4 w-4" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'complaint', label: 'Complaint', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'other', label: 'Other', icon: <MessageSquare className="h-4 w-4" />, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="relative p-8 pt-10">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Feedback Received!</h2>
                  <p className="text-sm font-bold text-slate-500 mt-2">We appreciate your input. Our team will review this shortly.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Help us Improve</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Submit a complaint or suggestion</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Feedback Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {types.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id as FeedbackType)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                            type === t.id 
                              ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                              : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${type === t.id ? 'bg-white/20' : t.bg}`}>
                            <span className={type === t.id ? 'text-white' : t.color}>{t.icon}</span>
                          </div>
                          <span className="text-xs font-bold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject</Label>
                    <Input 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Application flow bug"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Your Message</Label>
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-sm resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Submit Feedback
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
