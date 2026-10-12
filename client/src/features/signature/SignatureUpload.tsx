import React, { useState, useRef } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { api } from '../../app/providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { UploadCloud, X } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';

export const SignatureUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      toast('error', 'Only PNG, JPG, or WEBP allowed');
      return;
    }
    
    if (selected.size > 2 * 1024 * 1024) {
      toast('error', 'File size must be under 2MB');
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('signature', file);

    try {
      await api.post('/users/me/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast('success', 'Signature uploaded successfully');
      setFile(null);
      // Wait to reload user to show new signature or something
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">My Signature</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Upload your signature to attach to expense vouchers. (Max 2MB, PNG/JPG)
      </p>

      {user?.signature_url && !preview && (
        <div className="mb-6">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Current Signature:</p>
          <div className="bg-white/90 p-4 rounded-lg inline-block">
            <img src={`http://localhost:5000${user.signature_url}`} alt="Signature" className="h-20 object-contain" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!preview ? (
          <div 
            className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-10 h-10 text-white/50 mb-3" />
            <p className="text-white font-medium">Click to upload or drag & drop</p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative inline-block bg-white/90 p-4 rounded-lg">
            <button 
              onClick={clearFile}
              className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--danger)] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={preview} alt="Preview" className="h-24 object-contain" />
          </div>
        )}

        {file && (
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={clearFile}>Cancel</Button>
            <Button variant="primary" onClick={handleUpload} isLoading={isUploading}>
              Save Signature
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
