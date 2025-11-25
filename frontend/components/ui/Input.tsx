'use client';

import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const baseClasses =
  'w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={[baseClasses, className].filter(Boolean).join(' ')} {...props} />
));

Input.displayName = 'Input';

export default Input;

