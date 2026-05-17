import React from 'react';
import { Application } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, Clock, FileText, ShieldCheck, AlertCircle } from 'lucide-react';

interface ApplicationStatusProps {
  applications: Application[];
}

export default function ApplicationStatus({ applications }: ApplicationStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'reviewed': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending': return <FileText className="h-5 w-5 text-orange-600" />;
      case 'agreement': return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      case 'setup': return <Clock className="h-5 w-5 text-indigo-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'agreement': return 'bg-purple-100 text-purple-700';
      case 'setup': return 'bg-indigo-100 text-indigo-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (applications.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-white p-4 shadow-sm">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No active applications</h3>
          <p className="mt-1 text-sm text-slate-500 text-center max-w-xs">
            Explore our verified brand opportunities to start your application process.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  {getStatusIcon(app.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{app.opportunityName}</CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-orange-200 text-orange-600">
                      {app.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Application ID: {app.id}</p>
                </div>
              </div>
              <Badge className={getStatusColor(app.status)}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-100" />
              
              <div className="space-y-8">
                <TimelineItem 
                  title="Lead Accepted" 
                  date={app.dateApplied} 
                  completed={['pending', 'reviewed', 'agreement', 'setup', 'completed'].includes(app.status)}
                  description="Your application has been accepted as a potential lead."
                />
                <TimelineItem 
                  title="Brand Review" 
                  date={['reviewed', 'agreement', 'setup', 'completed'].includes(app.status) ? app.lastUpdate : 'Pending'} 
                  completed={['reviewed', 'agreement', 'setup', 'completed'].includes(app.status)}
                  description="The brand is reviewing your profile and location details."
                />
                <TimelineItem 
                  title="Agreement Phase" 
                  date={['agreement', 'setup', 'completed'].includes(app.status) ? app.lastUpdate : 'Awaiting'} 
                  completed={['agreement', 'setup', 'completed'].includes(app.status)}
                  description="Legal agreement and brand partnership terms are being finalized."
                />
                <TimelineItem 
                  title="Final Setup" 
                  date={['setup', 'completed'].includes(app.status) ? app.lastUpdate : 'Awaiting'} 
                  completed={['setup', 'completed'].includes(app.status)}
                  description="Physical setup of your business unit and final verification."
                />
              </div>
            </div>

            {app.notes && (
              <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-100">
                <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Consultant Note
                </p>
                <p className="mt-1 text-sm text-blue-700">{app.notes}</p>
              </div>
            )}

            {app.followUps && app.followUps.some(f => f.reminderDate) && (
              <div className="mt-4 rounded-lg bg-orange-50 p-4 border border-orange-100">
                <p className="text-xs font-black text-orange-800 flex items-center gap-2 uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  Upcoming Follow-ups
                </p>
                <div className="mt-2 space-y-2">
                  {app.followUps
                    .filter(f => f.reminderDate && !f.completed)
                    .map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-bold text-orange-700">
                        <span>{f.note}</span>
                        <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-600 bg-white">
                          {new Date(f.reminderDate!).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <Button 
                variant={app.status === 'completed' ? 'outline' : 'default'}
                className={`rounded-xl font-bold ${app.status === 'completed' ? 'text-green-600 border-green-200 hover:bg-green-50' : 'bg-slate-900 text-white hover:bg-orange-600'}`}
              >
                {app.status === 'pending' ? 'Submit KYC Documents' : 
                 app.status === 'reviewed' ? 'Schedule Site Visit' : 
                 app.status === 'agreement' ? 'Download Draft Agreement' :
                 app.status === 'setup' ? 'Upload Setup Progress' :
                 app.status === 'completed' ? 'Download Certificate' : 'Review Status'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TimelineItem({ title, date, completed, description }: { 
  title: string; 
  date: string; 
  completed: boolean;
  description: string;
}) {
  return (
    <div className="relative pl-10">
      <div className={`absolute left-2 top-1 h-4 w-4 rounded-full border-2 bg-white transition-colors ${
        completed ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
      }`}>
        {completed && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-bold ${completed ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h4>
          <span className="text-xs text-slate-400">{date}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
