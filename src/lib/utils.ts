import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null, currency = 'INR'): string {
  if (amount === undefined || amount === null) return 'Stipend undisclosed';
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Rolling deadline';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getEligibilityBadgeColor(status: 'eligible' | 'ineligible' | 'unknown'): { bg: string; text: string; border: string } {
  switch (status) {
    case 'eligible':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'ineligible':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'unknown':
    default:
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-cyan-400';
  if (score >= 60) return 'text-purple-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-slate-400';
}
