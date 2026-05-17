import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  Save,
  PenLine,
  TrendingUp,
  Image as ImageIcon,
  History,
  Info,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import ImageUpload from './ImageUpload';

const DOC_TYPES = [
  { key: 'GST Certificate', label: 'GST Certificate' },
  { key: 'Business Registration', label: 'Business Registration' },
  { key: 'PAN Card', label: 'PAN Card' },
  { key: 'Aadhar Card', label: 'Aadhar Card' },
];

function DocStatusIcon({ status }: { status: string }) {
  if (status === 'verified') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-orange-400" />;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    bio: user.bio || '',
    photoURL: user.photoURL || '',
    state: user.state || '',
    district: user.district || '',
    investment_range: user.investment_range || '',
  });
  const [loading, setLoading] = useState(false);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const docInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleDocUpload = async (docType: string, file: File) => {
    if (file.size > 500 * 1024) { toast.error('File too large. Max 500KB.'); return; }
    setDocUploading(docType);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const existing = user.verification_docs || [];
      const updated = existing.filter(d => d.type !== docType);
      updated.push({ type: docType, url: base64, status: 'pending', uploadedAt: new Date().toISOString() });
      await api.patch(`/users/${user.id}`, { verification_docs: updated });
      toast.success(`${docType} uploaded! Under review.`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setDocUploading(null);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}`, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-0">
      {/* Header Profile Card */}
      <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] md:rounded-[3rem] bg-white">
        <div className="h-24 md:h-32 bg-slate-900 relative">
          <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-12">
            <div className="relative group">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-1.5 md:p-2 shadow-xl ring-4 ring-white relative overflow-hidden">
                <div className="h-full w-full rounded-[2rem] overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100 italic">
                  {formData.photoURL ? (
                    <img 
                      src={formData.photoURL} 
                      alt={formData.name} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-slate-300" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0">
                    <ImageUpload 
                      label="" 
                      onUpload={(url) => setFormData({...formData, photoURL: url})} 
                      value={formData.photoURL}
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="absolute -right-2 -bottom-2 h-10 w-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg animate-bounce z-10 pointer-events-none">
                  <Camera className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-4 md:top-6 right-4 md:right-8 flex gap-2 md:gap-3">
             <Button 
               variant="outline" 
               className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest h-8 md:h-10 px-3 md:px-6"
               onClick={() => setIsEditing(!isEditing)}
             >
               {isEditing ? 'Cancel' : <><PenLine className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2" /> Edit</>}
             </Button>
             <Button 
               variant="outline" 
               className="bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/20 backdrop-blur-md rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest h-8 md:h-10 px-3 md:px-6"
               onClick={onLogout}
             >
               <LogOut className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2" /> Logout
             </Button>
          </div>
        </div>

        <CardContent className="pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-4 md:p-8">
            <div className="space-y-3 md:space-y-4 max-w-xl">
               <div className="flex items-center gap-2 md:gap-3">
                 <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                 <Badge className={`${user.role === 'brand_owner' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} border-none px-3 md:px-4 py-0.5 md:py-1 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest`}>
                    {user.role === 'brand_owner' ? 'Brand' : 'Investor'}
                 </Badge>
               </div>
               
               {isEditing ? (
                 <textarea 
                   className="w-full h-24 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                   placeholder="Write a brief bio about yourself or your business goals..."
                   value={formData.bio}
                   onChange={(e) => setFormData({...formData, bio: e.target.value})}
                 />
               ) : (
                 <p className="text-slate-500 font-medium leading-relaxed italic">
                   {user.bio || "No bio added yet. Tell us about your business journey."}
                 </p>
               )}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Status</p>
                   <p className="text-xs font-bold text-slate-900">Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trust Index</p>
                   <p className="text-xs font-bold text-slate-900">High Match</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-4 md:p-8">
        <Card className="md:col-span-2 border-none shadow-xl rounded-[2rem] md:rounded-[3rem] bg-white p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-slate-900" />
            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight underline decoration-slate-200 decoration-2 md:decoration-4 underline-offset-8">Information</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-4 md:p-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</Label>
                 {isEditing ? (
                   <Input 
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                   />
                 ) : (
                   <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-50 font-black text-slate-900">{user.name}</div>
                 )}
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Contact Email</Label>
                 <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-50 font-black text-slate-400 italic">
                   <Mail className="h-4 w-4 mr-3 opacity-30" />
                   {user.email}
                 </div>
                 <p className="text-[9px] text-slate-400 font-bold pl-1 italic">* Email cannot be changed for security reasons.</p>
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Whatsapp Number</Label>
                 {isEditing ? (
                   <Input 
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     placeholder="+91 XXXXX XXXXX"
                     className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                   />
                 ) : (
                   <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-50 font-black text-slate-900">
                     <Phone className="h-4 w-4 mr-3 text-green-500" />
                     {user.phone || 'Not linked'}
                   </div>
                 )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">State</Label>
                 {isEditing ? (
                   <Input 
                     value={formData.state}
                     onChange={(e) => setFormData({...formData, state: e.target.value})}
                     className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                   />
                 ) : (
                   <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-50 font-black text-slate-900">
                     <MapPin className="h-4 w-4 mr-3 text-red-500" />
                     {user.state || 'Not set'}
                   </div>
                 )}
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">District / City</Label>
                 {isEditing ? (
                   <Input 
                     value={formData.district}
                     onChange={(e) => setFormData({...formData, district: e.target.value})}
                     className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                   />
                 ) : (
                   <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-50 font-black text-slate-900">
                     {user.district || 'Not set'}
                   </div>
                 )}
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Investment Liquidity</Label>
                 {isEditing ? (
                   <select 
                     className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold focus:ring-slate-900"
                     value={formData.investment_range}
                     onChange={(e) => setFormData({...formData, investment_range: e.target.value})}
                   >
                     <option>₹10K - ₹2L</option>
                     <option>₹2L - ₹10L</option>
                     <option>₹10L - ₹50L</option>
                     <option>₹50L - ₹1Cr</option>
                     <option>₹1Cr+</option>
                   </select>
                 ) : (
                   <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-100 bg-slate-900 text-white font-black">
                     {user.investment_range || 'Not declared'}
                   </div>
                 )}
               </div>

               {user.role === 'brand_owner' && user.admin_actions && user.admin_actions.length > 0 && (
                 <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <History className="h-4 w-4 text-orange-600" />
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Admin Modifications</h4>
                    </div>
                    <div className="space-y-3">
                       {user.admin_actions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((action, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 flex gap-3">
                            <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-slate-900">{action.description}</p>
                               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                 {new Date(action.timestamp).toLocaleDateString()} • {action.adminName}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-12">
               <Button 
                onClick={handleUpdate}
                disabled={loading}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
               >
                 {loading ? 'Processing...' : <><Save className="h-6 w-6 mr-3" /> Save Changes & Deploy</>}
               </Button>
            </div>
          )}
        </Card>

        <div className="space-y-8">
           <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-4 md:p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h4 className="text-sm font-black uppercase tracking-widest">Platform Stats</h4>
              </div>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Completion</p>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: '85%' }} />
                       </div>
                       <span className="text-xs font-black">85%</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leads Shared</p>
                       <p className="text-xl font-black mt-1">12</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meetings</p>
                       <p className="text-xl font-black mt-1">4</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-4 md:p-8 border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Profile Image Control</h4>
              {isEditing ? (
                <div className="space-y-4">
                  <ImageUpload 
                    label="Direct Upload" 
                    onUpload={(url) => setFormData({...formData, photoURL: url})} 
                    value={formData.photoURL} 
                  />
                  <div className="pt-4 border-t border-slate-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Or Paste URL</Label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      className="h-12 rounded-xl border-2 border-slate-100 text-xs font-bold mt-2"
                      value={formData.photoURL}
                      onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 opacity-40">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5" />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 truncate max-w-[120px]">{user.photoURL ? 'Custom Photo Active' : 'No image set'}</p>
                </div>
              )}
           </Card>
        </div>
      </div>

      {/* Verification Documents — brand owners */}
      {user.role === 'brand_owner' && (
        <div className="px-4 sm:px-0 pb-8 md:px-8">
          <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[3rem] bg-white p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-black text-slate-900">Verification Documents</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload documents to get a verified badge on your listings</p>
              </div>
              {user.is_verified && (
                <Badge className="ml-auto bg-green-100 text-green-700 border-none rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>

            {!user.is_verified && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-6">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                  Upload at least one document below. Our team reviews within 24-48 hours and adds the verified badge to your listings.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {DOC_TYPES.map(({ key, label }) => {
                const existing = user.verification_docs?.find(d => d.type === key);
                return (
                  <div key={key} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-black text-slate-900">{label}</span>
                      </div>
                      {existing ? (
                        <div className="flex items-center gap-1">
                          <DocStatusIcon status={existing.status} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            existing.status === 'verified' ? 'text-green-600' :
                            existing.status === 'rejected' ? 'text-red-600' : 'text-orange-500'
                          }`}>
                            {existing.status === 'verified' ? 'Verified' : existing.status === 'rejected' ? 'Rejected' : 'Under Review'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Not uploaded</span>
                      )}
                    </div>

                    {existing?.status === 'rejected' && existing.rejectionReason && (
                      <p className="text-[10px] text-red-600 font-medium bg-red-50 rounded-xl px-3 py-2">{existing.rejectionReason}</p>
                    )}

                    <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        ref={el => { docInputRefs.current[key] = el; }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(key, f); }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={docUploading === key}
                        onClick={() => docInputRefs.current[key]?.click()}
                        className="w-full h-9 rounded-xl border-slate-200 text-xs font-bold gap-2 hover:bg-white"
                      >
                        {docUploading === key ? (
                          <><Clock className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="h-3.5 w-3.5" /> {existing ? 'Re-upload' : 'Upload'}</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
