import React, { useState, useEffect } from 'react';
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
import { Checkbox } from './ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Opportunity } from '../types';
import { ArrowRight, Info } from 'lucide-react';
import { INDIA_STATES_DISTRICTS, INVESTMENT_RANGES } from '../constants';

interface CustomQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onSubmit: (responses: { questionId: string; question: string; answer: string }[]) => void;
  user: any;
}

export default function CustomQuestionsModal({ isOpen, onClose, opportunity, onSubmit, user }: CustomQuestionsModalProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [selectedState, setSelectedState] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribedToNewsletter, setSubscribedToNewsletter] = useState(false);

  useEffect(() => {
    if (selectedState) {
      setDistricts(INDIA_STATES_DISTRICTS[selectedState] || []);
      setResponses(prev => ({ ...prev, district: '' }));
    }
  }, [selectedState]);

  useEffect(() => {
    if (isOpen && user) {
      setResponses(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        mobile: prev.mobile || user.phone || '',
      }));
    }
  }, [isOpen, user]);

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      alert("Please agree to the Terms & Conditions to proceed.");
      return;
    }

    const formattedResponses = [
      { questionId: 'name', question: 'Name', answer: responses.name || '' },
      { questionId: 'email', question: 'Email', answer: responses.email || '' },
      { questionId: 'mobile', question: 'Mobile', answer: responses.mobile || '' },
      { questionId: 'address', question: 'Address', answer: responses.address || '' },
      { questionId: 'pincode', question: 'Pincode', answer: responses.pincode || '' },
      { questionId: 'state', question: 'State', answer: selectedState },
      { questionId: 'district', question: 'District', answer: responses.district || '' },
      { questionId: 'investment', question: 'Investment Range', answer: responses.investment || '' },
      { questionId: 'space', question: 'Available Space (sq ft)', answer: responses.space || '' },
      { questionId: 'newsletter', question: 'Newsletter Subscription', answer: subscribedToNewsletter ? 'Yes' : 'No' },
    ];

    onSubmit(formattedResponses);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Apply for {opportunity.brand_name}</DialogTitle>
          <DialogDescription>
            Please provide the following mandatory information to apply for this {opportunity.type}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Enter Name *</Label>
              <Input 
                required
                placeholder="Full Name"
                value={responses.name || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Enter E-mail *</Label>
              <Input 
                type="email"
                required
                placeholder="email@example.com"
                value={responses.email || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Select State *</Label>
              <Select onValueChange={setSelectedState} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(INDIA_STATES_DISTRICTS).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Select District *</Label>
              <Select 
                disabled={!selectedState}
                onValueChange={(val: string) => setResponses(prev => ({ ...prev, district: val }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedState ? "Select District" : "Select State First"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Enter Mobile *</Label>
              <Input 
                required
                placeholder="10-digit mobile number"
                value={responses.mobile || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Enter Pincode *</Label>
              <Input 
                required
                placeholder="6-digit pincode"
                value={responses.pincode || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Enter Address *</Label>
            <Input 
              required
              placeholder="Full Address"
              value={responses.address || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Select Investment Range *</Label>
            <Select onValueChange={(val: string) => setResponses(prev => ({ ...prev, investment: val }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose Range" />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_RANGES.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Available Commercial Space (Approx sq ft) *</Label>
            <Input 
              required
              placeholder="e.g. 500 or NA if searching"
              value={responses.space || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, space: e.target.value }))}
            />
          </div>

          {/* Brand Specific Questions */}
          {opportunity.customQuestions && opportunity.customQuestions.length > 0 && (
            <div className="pt-4 border-t space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Brand Specific Questions</p>
              {opportunity.customQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">{q.question} *</Label>
                  {q.type === 'select' ? (
                    <Select 
                      onValueChange={(val: string) => setResponses(prev => ({ ...prev, [q.id]: val }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={q.type}
                      required
                      placeholder="Your answer..."
                      value={responses[q.id] || ''}
                      onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="newsletter" 
                checked={subscribedToNewsletter}
                onCheckedChange={(checked) => setSubscribedToNewsletter(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="newsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Yes, I want to subscribe for weekly Newsletter *
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                required
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms & Conditions *
                </label>
                <p className="text-[10px] text-slate-500">
                  By clicking, you agree to our platform policy for Tier 2 & 3 expansion.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Submit Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
