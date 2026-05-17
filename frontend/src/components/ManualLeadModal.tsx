import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, Phone, Mail, User, Briefcase } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Opportunity } from '../types';

interface ManualLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  opportunities: Opportunity[];
}

export default function ManualLeadModal({ isOpen, onClose, onSubmit, opportunities }: ManualLeadModalProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    opportunityId: opportunities[0]?.id || 'manual',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ 
      userName: '', 
      userEmail: '', 
      userPhone: '', 
      opportunityId: opportunities[0]?.id || 'manual' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-600" />
            Add Manual Lead
          </DialogTitle>
          <DialogDescription>
            Enter details of an investor you've spoken with directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold">Investor Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                required
                className="pl-10"
                placeholder="Full Name"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                required
                type="email"
                className="pl-10"
                placeholder="email@example.com"
                value={formData.userEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                required
                className="pl-10"
                placeholder="+91 98765 43210"
                value={formData.userPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, userPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Inquiry For</Label>
            <Select 
              value={formData.opportunityId}
              onValueChange={(val) => setFormData(prev => ({ ...prev, opportunityId: val }))}
            >
              <SelectTrigger className="pl-10 relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <SelectValue placeholder="Select Opportunity" />
              </SelectTrigger>
              <SelectContent>
                {opportunities.map(opp => (
                  <SelectItem key={opp.id} value={opp.id}>{opp.brand_name}</SelectItem>
                ))}
                <SelectItem value="manual">General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Add to Dashboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
