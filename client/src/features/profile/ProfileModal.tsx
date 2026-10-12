import React, { useState, useRef, useEffect } from 'react';
import { useAuth, api } from '../../app/providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { User, Mail, Shield, Building2, Hash, PenTool, UploadCloud, CheckCircle, Trash2, Edit2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Signature state
  const [sigMode, setSigMode] = useState<'upload' | 'draw'>('upload');
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [isUploadingSig, setIsUploadingSig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || '');
      setEmployeeCode(user.employee_code || '');
    }
  }, [user, isOpen]);

  // Canvas drawing helpers
  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [sigMode, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
        setSigFile(file);
      }
    });
  };

  // Upload or update signature
  const handleUploadSignature = async () => {
    if (!sigFile) {
      toast('error', 'Please select or draw a signature first');
      return;
    }

    try {
      setIsUploadingSig(true);
      const formData = new FormData();
      formData.append('signature', sigFile);

      await api.post('/users/me/signature', formData);
      toast('success', 'Signature saved successfully');
      setSigFile(null);
      await refreshUser();
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Failed to upload signature');
    } finally {
      setIsUploadingSig(false);
    }
  };

  // Save profile info (name, department, employee code)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/users/me', {
        name,
        department,
        employee_code: employeeCode
      });
      toast('success', 'Profile updated successfully');
      setIsEditing(false);
      await refreshUser();
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile & Identity">
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-white/20 shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-white truncate">{user?.name}</h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                user?.role === 'DIRECTOR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                user?.role === 'ACCOUNTS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.department || 'General'}</span>
              {user?.employee_code && (
                <>
                  <span className="text-slate-600">•</span>
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.employee_code}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* User Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h5>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-[var(--accent-primary)] hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Details
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || '');
                  setDepartment(user?.department || '');
                  setEmployeeCode(user?.employee_code || '');
                }}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter full name"
                  required
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-slate-800/40 border border-white/5 rounded-lg text-slate-200">
                  {user?.name}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <div className="px-3 py-2 text-sm bg-slate-800/40 border border-white/5 rounded-lg text-slate-400 cursor-not-allowed">
                {user?.email}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
              </label>
              {isEditing ? (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
              ) : (
                <div className="px-3 py-2 text-sm bg-slate-800/40 border border-white/5 rounded-lg text-slate-200">
                  {user?.department || 'General'}
                </div>
              )}
            </div>

            {/* Employee Code */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Employee / Staff Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. EMP-1042"
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-slate-800/40 border border-white/5 rounded-lg text-slate-200 font-mono">
                  {user?.employee_code || 'Not assigned'}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Profile
              </Button>
            </div>
          )}
        </form>

        {/* Digital Signature Management Section */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Signature</h5>
            {user?.signature_url && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Signature Active
              </span>
            )}
          </div>

          {/* Current Saved Signature */}
          {user?.signature_url ? (
            <div className="p-4 rounded-xl border border-white/10 bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner flex items-center justify-center max-w-[200px] h-20 w-full">
                <img
                  src={`http://localhost:5000${user.signature_url}`}
                  alt="Official Signature"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-200">Current Saved Signature</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This signature will be attached when you submit or approve vouchers.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              ⚠️ You have not configured a default signature yet. Draw or upload below to save one.
            </p>
          )}

          {/* Upload or Draw New Signature */}
          <div className="space-y-3 mt-3">
            <div className="flex p-1 bg-slate-800/80 border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => { setSigMode('upload'); setSigFile(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  sigMode === 'upload' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => { setSigMode('draw'); setSigFile(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  sigMode === 'draw' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> Draw Digital
              </button>
            </div>

            {sigFile ? (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Signature File Ready</p>
                    <p className="text-[11px] text-slate-300 font-mono">{sigFile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSigFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleUploadSignature}
                    isLoading={isUploadingSig}
                  >
                    Save Signature
                  </Button>
                </div>
              </div>
            ) : sigMode === 'draw' ? (
              <div className="border border-white/15 rounded-xl bg-slate-900 overflow-hidden flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={150}
                  className="bg-white cursor-crosshair w-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseUp={endDrawing}
                  onMouseOut={endDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={endDrawing}
                  onTouchMove={draw}
                />
                <div className="w-full flex justify-between p-2.5 bg-slate-800/90 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={clearCanvas}>
                    Clear
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={saveDrawnSignature}>
                    Confirm Drawing
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-white/20 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSigFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 text-[var(--accent-primary)] flex items-center justify-center mb-2 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Click to upload signature</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP (Max 2MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => setSigFile(e.target.files?.[0] || null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
