import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../app/providers/AuthProvider';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus } from 'lucide-react';

const statusMap: Record<string, { label: string, variant: any }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' }
};

export const VoucherList = () => {
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const res = await api.get('/vouchers');
      return res.data.data.vouchers;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-['Plus_Jakarta_Sans']">My Vouchers</h1>
          <p className="text-[var(--text-secondary)]">Manage your expense submissions</p>
        </div>
        <Button onClick={() => navigate('/employee/vouchers/new')} className="gap-2">
          <Plus className="w-4 h-4" /> New Voucher
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No vouchers yet" 
            description="You haven't created any expense vouchers. Click the button above to start."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((v: any) => (
                <TableRow 
                  key={v.id} 
                  className="cursor-pointer hover:bg-slate-50/50"
                  onClick={() => navigate(`/employee/vouchers/${v.id}`)}
                >
                  <TableCell className="font-medium text-[var(--text-primary)]">{v.voucher_number}</TableCell>
                  <TableCell>{new Date(v.expense_date).toLocaleDateString()}</TableCell>
                  <TableCell>{v.title}</TableCell>
                  <TableCell>{v.category}</TableCell>
                  <TableCell>₹{Number(v.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[v.status]?.variant}>
                      {statusMap[v.status]?.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
};
