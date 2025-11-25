'use client';

import * as React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, checked, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <div className={`h-5 w-5 rounded-full border-2 transition-all ${
          checked 
            ? 'border-emerald-500 bg-emerald-500' 
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
      {label && <span>{label}</span>}
    </label>
  )
);

Radio.displayName = 'Radio';

export default Radio;

