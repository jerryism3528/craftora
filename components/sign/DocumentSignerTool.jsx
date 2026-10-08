'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Upload, UserPlus, MousePointerClick, Send, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { UploadBox } from './DocsDashboard';

export default function DocumentSignerTool() {
  const { status } = useSession();
  const steps = [
    [Upload, 'Upload a PDF'], [UserPlus, 'Add signers'], [MousePointerClick, 'Place fields'], [Send, 'Send and track'], [ShieldCheck, 'Get the signed PDF'],
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map(([Icon, label], i) => (
          <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-center">
            <Icon className="w-5 h-5 mx-auto text-indigo-500" />
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1.5">{i + 1}. {label}</div>
          </div>
        ))}
      </div>
      {status === 'authenticated' ? (
        <>
          <UploadBox />
          <div className="text-center">
            <Link href="/account/documents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"><LayoutDashboard className="w-4 h-4" /> Open my documents</Link>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-10 px-6 text-center">
          <Upload className="w-8 h-8 mx-auto text-indigo-500" />
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">Send your first document for signature</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">A free account keeps your documents private and lets you track every signer. Signers do not need an account.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <Link href="/signup" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Create free account</Link>
            <Link href="/login" className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">Sign in</Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Just need to sign a PDF yourself? Use <Link href="/sign-pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">Sign PDF</Link>, no account needed.</p>
        </div>
      )}
    </div>
  );
}
