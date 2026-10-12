import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../app/providers/AuthProvider';
import { GlassCard } from '../../components/ui/GlassCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';

import { Button } from '../../components/ui/Button';

const statusMap: Record<string, { label: string, variant: any }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' }
};

export const AccountsVouchers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vouchers-accounts', search],
    queryFn: async () => {
      const res = await api.get('/vouchers', { params: { search, status: 'APPROVED' } });
      return res.data.data.vouchers;
    }
  });

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['Voucher ID', 'Employee', 'Date', 'Amount', 'Status'];
    const rows = data.map((v: any) => [
      v.voucher_number,
      v.employee.name,
      new Date(v.expense_date).toLocaleDateString(),
      v.amount,
      v.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map((e: any[]) => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `approved_vouchers_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">Approved Vouchers</h1>
          <p className="text-[var(--text-secondary)]">View and print approved expense submissions</p>
        </div>
        <Button onClick={exportToCSV} variant="primary" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </Button>
      </div>

      <GlassCard className="p-4">
        <Input 
          placeholder="Search by ID, title, or employee..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No approved vouchers" 
            description="There are no approved vouchers ready for reimbursement."
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
                  onClick={() => navigate(`/accounts/vouchers/${v.id}`)}
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
