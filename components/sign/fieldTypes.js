import { PenLine, Type, CalendarDays, User, Mail, TextCursorInput, CheckSquare } from 'lucide-react';

export const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#d946ef', '#84cc16', '#f97316', '#14b8a6', '#8b5cf6'];

// Default sizes are fractions of page width (w) and page height (h).
export const FIELD_TYPES = {
  signature: { label: 'Signature', Icon: PenLine, w: 0.26, h: 0.055 },
  initials: { label: 'Initials', Icon: Type, w: 0.1, h: 0.05 },
  date: { label: 'Date signed', Icon: CalendarDays, w: 0.18, h: 0.03 },
  name: { label: 'Full name', Icon: User, w: 0.24, h: 0.03 },
  email: { label: 'Email', Icon: Mail, w: 0.26, h: 0.03 },
  text: { label: 'Text', Icon: TextCursorInput, w: 0.26, h: 0.03 },
  checkbox: { label: 'Checkbox', Icon: CheckSquare, w: 0.03, h: 0 },
};

export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export const STATUS = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  sent: { label: 'Waiting for others', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  finalizing: { label: 'Finishing', cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  declined: { label: 'Declined', cls: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  voided: { label: 'Voided', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  expired: { label: 'Expired', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
};

export const SIGNER_STATUS = {
  pending: { label: 'Not sent yet', cls: 'text-slate-500 dark:text-slate-400' },
  sent: { label: 'Email sent', cls: 'text-amber-600 dark:text-amber-400' },
  viewed: { label: 'Opened', cls: 'text-sky-600 dark:text-sky-400' },
  signed: { label: 'Signed', cls: 'text-emerald-600 dark:text-emerald-400' },
  declined: { label: 'Declined', cls: 'text-red-600 dark:text-red-400' },
};
