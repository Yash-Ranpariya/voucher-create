import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../app/providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

const voucherSchema = z.object({
  voucher_date: z.string().min(1, 'Required'),
  expense_date: z.string().min(1, 'Required').refine(date => new Date(date) <= new Date(), "Cannot be in the future"),
  department: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  category: z.enum(['TRAVEL', 'FOOD', 'ACCOMMODATION', 'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'OTHER']),
  description: z.string(),
  amount: z.number().positive('Must be greater than 0'),
  receipt_url: z.string().optional(),
});

type FormData = z.infer<typeof voucherSchema>;

export const VoucherForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      voucher_date: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
    }
  });

  const { data: voucher } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => {
      const res = await api.get(`/vouchers/${id}`);
      return res.data.data.voucher;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (voucher) {
      reset({
        voucher_date: new Date(voucher.voucher_date).toISOString(),
        expense_date: new Date(voucher.expense_date).toISOString().split('T')[0] + 'T00:00:00.000Z',
        department: voucher.department,
        title: voucher.title,
        category: voucher.category,
        description: voucher.description,
        amount: Number(voucher.amount),
      });
    }
  }, [voucher, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      
      let finalReceiptUrl = receiptUrl || data.receipt_url;
      if (receiptFile && !receiptUrl) {
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        const uploadRes = await api.post('/upload/scan', formData);
        finalReceiptUrl = uploadRes.data.data.url;
      }
      data.receipt_url = finalReceiptUrl;

      if (isEdit) {
        await api.put(`/vouchers/${id}`, data);
        toast('success', 'Draft updated successfully');
        navigate(`/employee/vouchers/${id}`);
      } else {
        const res = await api.post('/vouchers', data);
        toast('success', 'Draft created successfully');
        navigate(`/employee/vouchers/${res.data.data.voucher.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    } catch (err: any) {
      toast('error', err.response?.data?.error?.message || 'Failed to save voucher');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-['Plus_Jakarta_Sans']">
          {isEdit ? 'Edit Draft' : 'Create Voucher'}
        </h1>
        <p className="text-[var(--text-secondary)]">Fill in the expense details below</p>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input 
              label="Expense Date"
              type="date"
              {...register('expense_date', { 
                setValueAs: (v) => v ? new Date(v).toISOString() : '' 
              })}
              error={errors.expense_date?.message}
            />
            <Select 
              label="Category"
              {...register('category')}
              error={errors.category?.message}
              options={[
                { label: 'Travel', value: 'TRAVEL' },
                { label: 'Food', value: 'FOOD' },
                { label: 'Accommodation', value: 'ACCOMMODATION' },
                { label: 'Office Supplies', value: 'OFFICE_SUPPLIES' },
                { label: 'Software', value: 'SOFTWARE' },
                { label: 'Training', value: 'TRAINING' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input 
              label="Department"
              placeholder="e.g. Engineering"
              {...register('department')}
              error={errors.department?.message}
            />
            <Input 
              label="Amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
          </div>

          <Input 
            label="Title"
            placeholder="Brief title for this expense"
            {...register('title')}
            error={errors.title?.message}
          />

          <Textarea 
            label="Description"
            placeholder="Detailed reason for the expense"
            {...register('description')}
            error={errors.description?.message}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Receipt / Bill Image (Optional)</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isScanning ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-slate-300 hover:bg-slate-50'}`}
              onClick={() => !isScanning && fileInputRef.current?.click()}
            >
              {isScanning ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin mb-2" />
                  <p className="text-[var(--accent-primary)] text-sm font-medium">Scanning receipt with AI...</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="text-slate-600 font-medium text-sm">{receiptFile ? receiptFile.name : 'Click to upload receipt for AI Autofill'}</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setReceiptFile(file);
                  
                  try {
                    setIsScanning(true);
                    toast('info', 'Scanning receipt with AI...');
                    const formData = new FormData();
                    formData.append('receipt', file);
                    const res = await api.post('/upload/scan', formData);
                    const { url, extracted } = res.data.data;
                    
                    if (extracted.amount) {
                      setValue('amount', extracted.amount);
                      if (extracted.currency && extracted.currency !== 'INR') {
                        toast('info', `Converted ${extracted.currency} ${extracted.originalAmount} to ₹${extracted.amount} automatically!`);
                      }
                    }
                    if (extracted.date) {
                      setValue('expense_date', new Date(extracted.date).toISOString().split('T')[0] + 'T00:00:00.000Z');
                    }
                    if (extracted.category) setValue('category', extracted.category as any);
                    if (extracted.title) setValue('title', extracted.title);
                    setValue('description', extracted.text.substring(0, 200) + '...');
                    
                    setReceiptUrl(url);
                    toast('success', 'Receipt scanned! Details auto-filled.');
                  } catch (err) {
                    toast('error', 'Failed to scan receipt. Please enter details manually.');
                  } finally {
                    setIsScanning(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Save as Draft</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
