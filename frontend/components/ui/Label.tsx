'use client';

import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const baseClasses = 'text-sm font-medium text-slate-700';

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label ref={ref} className={[baseClasses, className].filter(Boolean).join(' ')} {...props} />
));

Label.displayName = 'Label';

export default Label;

