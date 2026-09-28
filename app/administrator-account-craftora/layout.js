import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }) {
  const session = await auth();
  // Hard gate: only admins get past this point.
  if (!session?.user?.id || !session.user.isAdmin) {
    redirect('/');
  }
  return <>{children}</>;
}
