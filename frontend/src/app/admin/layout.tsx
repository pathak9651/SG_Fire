import AdminGuard from '@/components/admin/AdminGuard';
import { ReactNode } from 'react';

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
