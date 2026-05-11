import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard | SG Fire',
  description: 'Manage your SG Fire account, orders, and appointments.',
};

export default function RootDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
