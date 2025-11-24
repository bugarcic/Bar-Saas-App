'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
  secondary: 'bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-800',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
};

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...props }, ref) => (
    <button ref={ref} className={cn(baseClasses, variants[variant], className)} {...props} />
  ),
);

Button.displayName = 'Button';

export default Button;

