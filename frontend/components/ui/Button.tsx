'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-white text-slate-900 hover:bg-slate-200 focus-visible:ring-white',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-700',
  outline: 'border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500',
};

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...props }, ref) => (
    <button ref={ref} className={cn(baseClasses, variants[variant], className)} {...props} />
  ),
);

Button.displayName = 'Button';

export default Button;

