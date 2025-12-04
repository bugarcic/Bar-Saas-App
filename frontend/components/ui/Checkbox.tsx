'use client';

import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, ...props }, ref) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
      checked
        ? 'border-blue-500 bg-blue-900/30'
        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
    } ${className}`}>
      <div className="relative mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, margin: 0, padding: 0, pointerEvents: 'none', appearance: 'none' }}
          {...props}
        />
        <div className={`h-5 w-5 rounded border-2 transition-all ${
          checked
            ? 'border-blue-500 bg-blue-500'
            : 'border-slate-500 bg-slate-800 peer-hover:border-slate-400'
        }`}>
          {checked && (
            <svg 
              className="h-full w-full text-white p-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div>
        {label && <div className="font-medium text-white">{label}</div>}
        {description && <div className="text-xs text-slate-400">{description}</div>}
      </div>
    </label>
  )
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
