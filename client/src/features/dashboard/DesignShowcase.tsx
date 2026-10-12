import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';

export const DesignShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Design System Showcase</h1>
        <p className="text-[var(--text-secondary)]">All components from Phase 3</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">GlassCard & Buttons</h2>
        <GlassCard className="p-6">
          <div className="flex gap-4 mb-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button isLoading>Loading</Button>
          </div>
          <div className="flex gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Inputs & Select & Textarea</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <Input placeholder="Default Input" />
            <Input placeholder="Error Input" error="This field is required" />
            <Select options={[{ label: 'Option 1', value: '1' }]} />
            <Select options={[{ label: 'Option 1', value: '1' }]} error="Selection required" />
          </GlassCard>
          <GlassCard className="p-6">
            <Textarea placeholder="Type something..." />
          </GlassCard>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Badges</h2>
        <GlassCard className="p-6 flex gap-4 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Toast Notifications</h2>
        <GlassCard className="p-6 flex gap-4">
          <Button variant="primary" onClick={() => toast('success', 'Operation successful!')}>Success Toast</Button>
          <Button variant="danger" onClick={() => toast('error', 'Action failed.')}>Error Toast</Button>
          <Button variant="ghost" onClick={() => toast('warning', 'Be careful.')}>Warning Toast</Button>
          <Button variant="ghost" onClick={() => toast('info', 'Here is some info.')}>Info Toast</Button>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Modal & Overlay</h2>
        <GlassCard className="p-6">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
            <p className="text-[var(--text-secondary)] mb-6">This is an example modal using framer-motion.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>VCH-2026-0001</TableCell>
              <TableCell>$120.00</TableCell>
              <TableCell><Badge variant="warning">Pending</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>VCH-2026-0002</TableCell>
              <TableCell>$45.00</TableCell>
              <TableCell><Badge variant="success">Approved</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Skeleton</h2>
          <GlassCard className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full" />
          </GlassCard>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Empty State</h2>
          <GlassCard>
            <EmptyState title="No vouchers found" description="You haven't submitted any expense vouchers yet. Click create to get started." />
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
