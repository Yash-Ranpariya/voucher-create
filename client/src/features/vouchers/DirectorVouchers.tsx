import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../app/providers/AuthProvider';
import { GlassCard } from '../../components/ui/GlassCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

const statusMap: Record<string, { label: string, variant: any }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' }
};

export const DirectorVouchers = ({ view = 'all' }: { view?: 'pending' | 'all' }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(view === 'pending' ? 'PENDING_APPROVAL' : '');

  const { data, isLoading } = useQuery({
    queryKey: ['vouchers', search, status],
    queryFn: async () => {
      const res = await api.get('/vouchers', { params: { search, status } });
      return res.data.data.vouchers;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">
          {view === 'pending' ? 'Pending Approvals' : 'All Vouchers'}
        </h1>
        <p className="text-[var(--text-secondary)]">Review and manage employee expense submissions</p>
      </div>

      <GlassCard className="p-4 flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search by ID, title, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {view === 'all' && (
          <div className="w-48">
            <Select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Pending', value: 'PENDING_APPROVAL' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' }
              ]} 
            />
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No vouchers found" 
            description="There are no vouchers matching your criteria."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((v: any) => (
                <TableRow 
                  key={v.id} 
                  className="cursor-pointer"
                  onClick={() => navigate(`/director/vouchers/${v.id}`)}
                >
                  <TableCell className="font-medium text-white">{v.voucher_number}</TableCell>
                  <TableCell>{v.employee.name}</TableCell>
                  <TableCell>{new Date(v.expense_date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{Number(v.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[v.status]?.variant}>
                      {statusMap[v.status]?.label || v.status}
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
