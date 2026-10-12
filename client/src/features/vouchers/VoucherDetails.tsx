import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../app/providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { ArrowLeft, Trash2, Edit, Send, CheckCircle, XCircle, Printer, UploadCloud, PenTool, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';

const SignaturePad = ({ onSave }: { onSave: (file: File) => void }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

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
    
    ctx.lineWidth = 3;
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
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
        onSave(file);
      }
    });
  };

  return (
    <div className="flex flex-col items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="bg-white cursor-crosshair w-full touch-none"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
      />
      <div className="w-full flex justify-between p-3 bg-white border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={clearCanvas} className="text-sm py-1 h-auto">
          Clear
        </Button>
        <Button variant="primary" type="button" onClick={handleSave} className="text-sm py-1 h-auto">
          Save Drawing
        </Button>
      </div>
    </div>
  );
};

export const VoucherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null);
  const [sigMode, setSigMode] = React.useState<'upload' | 'draw'>('upload');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { data: voucher, isLoading } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => {
      const res = await api.get(`/vouchers/${id}`);
      return res.data.data.voucher;
    }
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast('success', 'Draft deleted');
      navigate('/employee/vouchers');
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const handleSubmit = async () => {
    if (!signatureFile && !user?.signature_url) {
      toast('error', 'Signature file is required');
      return;
    }
    try {
      setIsProcessing(true);
      const formData = new FormData();
      if (signatureFile) formData.append('signature', signatureFile);
      const res = await api.post(`/vouchers/${id}/submit`, formData);
      toast('success', 'Voucher submitted successfully');
      setIsSubmitModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Submit failed. Have you uploaded your signature?');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!signatureFile) {
      toast('error', 'Signature file is required');
      return;
    }
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('signature', signatureFile);
      const res = await api.post(`/vouchers/${id}/approve`, formData);
      toast('success', 'Voucher approved');
      setIsApproveModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Approve failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast('error', 'Rejection reason is required');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await api.post(`/vouchers/${id}/reject`, { reason: rejectReason });
      toast('success', 'Voucher rejected');
      setIsRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Reject failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/vouchers/${id}/verify`);
      toast('success', 'Voucher verified and forwarded to Director');
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Verify failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-white">Loading...</div>;
  if (!voucher) return <div className="p-8 text-white">Voucher not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {voucher.status === 'DRAFT' && user?.role === 'EMPLOYEE' && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/employee/vouchers/${id}/edit`)} className="gap-2">
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)} className="gap-2">
              <Send className="w-4 h-4" /> Submit
            </Button>
          </div>
        )}

        {voucher.status === 'PENDING_APPROVAL' && user?.role === 'DIRECTOR' && (
          <div className="flex gap-3 print:hidden">
            <Button variant="danger" onClick={() => setIsRejectModalOpen(true)} className="gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button variant="success" onClick={() => setIsApproveModalOpen(true)} className="gap-2 bg-[var(--success)] hover:bg-[#28a77a] text-white">
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
          </div>
        )}

        {voucher.status === 'PENDING_ACCOUNTS_VERIFICATION' && user?.role === 'ACCOUNTS' && (
          <div className="flex gap-3 print:hidden">
            <Button variant="danger" onClick={() => setIsRejectModalOpen(true)} className="gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button variant="success" onClick={handleVerify} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" isLoading={isProcessing}>
              <CheckCircle className="w-4 h-4" /> Verify (Budget Check)
            </Button>
          </div>
        )}

        {voucher.status === 'APPROVED' && user?.role === 'ACCOUNTS' && (
          <div className="flex gap-3 print:hidden">
            <Button 
              variant="primary" 
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  const { data } = await api.post(`/vouchers/${id}/pay`);
                  const { order, key_id } = data.data;

                  const options = {
                    key: key_id,
                    amount: order.amount,
                    currency: order.currency,
                    name: "ABC Company Ltd.",
                    description: `Payment for Voucher ${voucher.voucher_number}`,
                    order_id: order.id.startsWith('order_mock_') ? undefined : order.id,
                    handler: async function (response: any) {
                      try {
                        await api.post(`/vouchers/${id}/verify-payment`, {
                          razorpay_payment_id: response.razorpay_payment_id || `mock_txn_${Date.now()}`,
                          razorpay_order_id: response.razorpay_order_id || order.id,
                          razorpay_signature: response.razorpay_signature || 'mock_sig'
                        });
                        toast('success', 'Payment successful!');
                        queryClient.invalidateQueries({ queryKey: ['voucher', id] });
                      } catch (e: any) {
                        toast('error', e.response?.data?.error?.message || 'Payment verification failed');
                      }
                    },
                    prefill: {
                      name: voucher.employee.name,
                      email: voucher.employee.email,
                    },
                    theme: {
                      color: "#38bdf8"
                    }
                  };

                  const loadRazorpay = () => new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                  });

                  await loadRazorpay();
                  const rzp1 = new (window as any).Razorpay(options);
                  rzp1.on('payment.failed', function (response: any){
                    toast('error', response.error.description);
                  });
                  rzp1.open();
                } catch (err: any) {
                  toast('error', 'Failed to initialize payment');
                } finally {
                  setIsProcessing(false);
                }
              }} 
              className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110" 
              isLoading={isProcessing}
            >
              <CheckCircle className="w-4 h-4" /> Pay with Razorpay
            </Button>
          </div>
        )}

        {user?.role === 'ACCOUNTS' && (
          <div className="print:hidden">
            <Button variant="ghost" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Print PDF
            </Button>
          </div>
        )}
      </div>

      {voucher.status === 'REJECTED' && voucher.rejection_reason && (
        <div className="bg-[var(--danger)]/20 border border-[var(--danger)]/30 p-4 rounded-lg text-white">
          <h4 className="font-semibold text-[var(--danger)] mb-1">Rejection Reason</h4>
          <p className="text-sm">{voucher.rejection_reason}</p>
        </div>
      )}

      {/* "Printed Voucher" Design */}
      <GlassCard className="p-0 overflow-hidden bg-white/95 text-gray-900 border-0">
        {/* Header */}
        <div className="border-b-2 border-gray-200 p-8 flex justify-between items-start bg-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Expense Voucher</h1>
            <p className="text-gray-500 mt-1">ABC Company Ltd.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Voucher No.</p>
            <p className="text-xl font-bold font-mono text-gray-900">{voucher.voucher_number}</p>
            <Badge variant="default" className="mt-2 text-gray-900 bg-gray-200 border-gray-300">{voucher.status}</Badge>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-12">
          {/* Status Timeline */}
          <div className="col-span-2 py-6 px-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Approval Timeline</h4>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full" />
              {['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].map((step, idx) => {
                const isActive = voucher.status === step || (step === 'PENDING_APPROVAL' && voucher.status === 'PENDING_ACCOUNTS_VERIFICATION') || (step === 'APPROVED' && voucher.status === 'PAID');
                const isPast = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].indexOf(voucher.status === 'PENDING_ACCOUNTS_VERIFICATION' ? 'PENDING_APPROVAL' : (voucher.status === 'PAID' ? 'APPROVED' : voucher.status)) > idx;
                
                return (
                  <div key={step} className="flex flex-col items-center bg-slate-50 px-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive || isPast ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                      {isPast ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive || isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Name</p>
            <p className="font-medium text-slate-800">{voucher.employee.name}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
            <p className="font-medium text-slate-800">{voucher.employee.department}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Expense</p>
            <p className="font-medium text-slate-800">{new Date(voucher.expense_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
            <p className="font-medium text-slate-800">{voucher.category}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</p>
            <p className="font-medium text-lg text-slate-900">{voucher.title}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{voucher.description}</p>
          </div>
          {voucher.receipt_url && (
            <div className="col-span-2 mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attached Receipt / Bill</p>
              <img src={`http://localhost:5000${voucher.receipt_url}`} alt="Receipt" className="max-h-80 rounded-xl border border-slate-200 object-contain shadow-sm bg-white p-2" />
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="border-y border-slate-200 p-8 flex justify-between items-center bg-slate-50/50">
          <p className="text-lg font-bold text-slate-700 uppercase tracking-wider">Total Amount</p>
          <p className="text-3xl font-bold text-[var(--accent-primary)] font-mono">₹{Number(voucher.amount).toFixed(2)}</p>
        </div>

        {/* Signatures */}
        <div className="p-8 grid grid-cols-2 gap-12 bg-white">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Employee Signature</p>
            <div className="h-24 border-b-2 border-slate-200 relative flex items-end justify-center pb-2">
              {voucher.employee_signature_url ? (
                <img src={`http://localhost:5000${voucher.employee_signature_url}`} alt="Employee Signature" className="max-h-20 object-contain absolute bottom-2" />
              ) : (
                <span className="text-slate-300 italic">No signature</span>
              )}
            </div>
            <p className="text-center mt-2 text-sm text-slate-500">Date: {voucher.submitted_at ? new Date(voucher.submitted_at).toLocaleDateString() : '—'}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Director Approval</p>
            <div className="h-24 border-b-2 border-slate-200 relative flex items-end justify-center pb-2">
              {voucher.director_signature_url ? (
                <img src={`http://localhost:5000${voucher.director_signature_url}`} alt="Director Signature" className="max-h-20 object-contain absolute bottom-2" />
              ) : (
                <span className="text-slate-300 italic">Pending signature</span>
              )}
            </div>
            <p className="text-center mt-2 text-sm text-slate-500">Date: {voucher.approved_at ? new Date(voucher.approved_at).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </GlassCard>

      {/* Audit Trail (Activity Logs) */}
      <GlassCard className="p-6 print:hidden border-[var(--border)]">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Audit Trail</h3>
        <div className="space-y-6">
          {voucher.activities && voucher.activities.length > 0 ? (
            voucher.activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative pl-6 border-l-2 border-slate-200 pb-6 last:pb-0">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)] ring-4 ring-white" />
                <p className="text-sm font-medium text-slate-800 mb-1">{activity.description}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{new Date(activity.created_at).toLocaleString()}</span>
                  <span>Action: {activity.action}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No activity logs found.</p>
          )}
        </div>
      </GlassCard>

      {/* Payment Information */}
      {voucher.status === 'PAID' && (
        <GlassCard className="p-6 border border-[var(--accent-secondary)] bg-[var(--accent-secondary)]/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--accent-secondary)]/20 rounded-full">
              <CheckCircle className="w-6 h-6 text-[var(--accent-secondary)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--accent-secondary)]">Payment Successful</h3>
              <p className="text-sm text-slate-600 mt-1">Transaction ID: <span className="font-mono font-medium text-slate-800">{voucher.transaction_id || 'N/A'}</span></p>
              <p className="text-xs text-slate-500 mt-1">Paid on: {voucher.paid_at ? new Date(voucher.paid_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Submit Voucher Signature Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Voucher">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Please provide your signature to submit this voucher for approval.</p>
          
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button 
              type="button"
              onClick={() => setSigMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${sigMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ImageIcon className="w-4 h-4" /> Upload
            </button>
            <button 
              type="button"
              onClick={() => setSigMode('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${sigMode === 'draw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PenTool className="w-4 h-4" /> Draw
            </button>
          </div>

          {signatureFile ? (
            <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white shadow-sm">
              <CheckCircle className="w-10 h-10 text-[var(--success)] mb-3" />
              <p className="text-slate-800 font-medium">Signature Ready: {signatureFile.name}</p>
              <Button variant="danger" onClick={() => setSignatureFile(null)} className="mt-4 text-sm gap-2">
                <Trash2 className="w-4 h-4" /> Remove Signature
              </Button>
            </div>
          ) : sigMode === 'draw' ? (
            <SignaturePad onSave={(file) => setSignatureFile(file)} />
          ) : (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-white group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setSignatureFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <p className="text-slate-700 font-medium">Drag & drop your signature here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse files (PNG, JPG, WEBP)</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isProcessing}>Confirm Submit</Button>
          </div>
        </div>
      </Modal>

      {/* Approve Voucher Signature Modal */}
      <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Voucher">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Please provide your signature to officially approve this voucher.</p>
          
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button 
              type="button"
              onClick={() => setSigMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${sigMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ImageIcon className="w-4 h-4" /> Upload
            </button>
            <button 
              type="button"
              onClick={() => setSigMode('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${sigMode === 'draw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PenTool className="w-4 h-4" /> Draw
            </button>
          </div>

          {signatureFile ? (
            <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white shadow-sm">
              <CheckCircle className="w-10 h-10 text-[var(--success)] mb-3" />
              <p className="text-slate-800 font-medium">Signature Ready: {signatureFile.name}</p>
              <Button variant="danger" onClick={() => setSignatureFile(null)} className="mt-4 text-sm gap-2">
                <Trash2 className="w-4 h-4" /> Remove Signature
              </Button>
            </div>
          ) : sigMode === 'draw' ? (
            <SignaturePad onSave={(file) => setSignatureFile(file)} />
          ) : (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-white group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setSignatureFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <p className="text-slate-700 font-medium">Drag & drop your signature here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse files (PNG, JPG, WEBP)</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleApprove} isLoading={isProcessing}>Confirm Approval</Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Voucher">
        <div className="space-y-4">
          <Textarea 
            label="Rejection Reason" 
            placeholder="Please provide a detailed reason for rejecting this voucher..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} isLoading={isProcessing}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
