import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary:
      'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 focus-visible:ring-brand-500',
    secondary:
      'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 border border-slateBorder dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/80 focus-visible:ring-slate-400',
    outline:
      'border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 focus-visible:ring-brand-500',
    danger:
      'bg-accent-rose hover:bg-red-600 text-white shadow-sm shadow-red-500/20 focus-visible:ring-red-500',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 focus-visible:ring-slate-400',
    emerald:
      'bg-accent-emerald hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};
