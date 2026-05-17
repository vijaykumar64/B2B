import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, MapPin, TrendingUp, Loader2, Sparkles, Building2, Users, Target } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export default function MarketIntelligence() {
  const [targetCity, setTargetCity] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!targetCity || !businessType) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the market for a ${businessType} business in ${targetCity}. 
        Identify 3-5 specific high-potential neighborhoods or areas for expansion. 
        For each area, provide:
        1. Why it's a good fit (demographics, footfall).
        2. Competition level (nearby similar businesses).
        3. Strategic advantage.
        Use real-world data from Google Maps to identify existing competitors and popular hubs.`,
        config: {
          tools: [{ googleMaps: {} }],
        }
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAnalysis("Sorry, I couldn't complete the market analysis at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>AI Market Intelligence</CardTitle>
          </div>
          <CardDescription>
            Use real-time Google Maps data and AI to identify the best locations for your next unit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Category</Label>
              <Input 
                id="businessType"
                placeholder="e.g. Premium Coffee Shop, Gym, Fast Food"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="border-orange-100 focus-visible:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetCity">Target City / Region</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  id="targetCity"
                  placeholder="e.g. Mumbai, Indiranagar Bangalore"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="pl-10 border-orange-100 focus-visible:ring-orange-500"
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleAnalyze}
            disabled={loading || !targetCity || !businessType}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Generate Expansion Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Strategic Expansion Report</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    AI Generated with Live Maps Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900">
                  <Markdown>{analysis}</Markdown>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <QuickStat 
                icon={<Building2 className="h-4 w-4" />}
                label="Competitor Density"
                value="Analyzed via Maps"
              />
              <QuickStat 
                icon={<Users className="h-4 w-4" />}
                label="Target Audience"
                value="Demographic Match"
              />
              <QuickStat 
                icon={<Search className="h-4 w-4" />}
                label="Search Volume"
                value="High Intent Areas"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
