import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  label: string;
  className?: string;
}

export default function ImageUpload({ onUpload, value, label, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 2MB for Base64 (Firestore has 1MB limit per doc, so we should be careful)
    // Actually, let's keep it under 200KB to be safe for Firestore documents
    if (file.size > 200 * 1024) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 200KB to ensure smooth database performance."
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please upload an image file (PNG, JPG, WEBP)."
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpload(base64String);
        setIsUploading(false);
        toast.success("Image uploaded successfully!");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      console.error("Upload error:", error);
      toast.error("Upload failed");
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{label}</p>
        {value && (
          <button 
            onClick={() => onUpload('')}
            className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      <div className="relative group">
        <div 
          className={`h-40 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden bg-slate-50/50 ${
            value ? 'border-transparent' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          {value ? (
            <img 
              src={value} 
              alt="Preview" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : <Upload className="h-6 w-6" />}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload photo</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase">Max size: 200KB</p>
            </>
          )}

          {!value && !isUploading && (
            <input
              type="file"
              ref={fileInputRef}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileChange}
            />
          )}
        </div>

        {value && !isUploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/40 text-white hover:bg-white/40 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Change Photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
