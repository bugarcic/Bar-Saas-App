'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HiOutlineCalendar } from 'react-icons/hi';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  showMonthYearPicker?: boolean;
  dateFormat?: string;
  maxDate?: Date;
  minDate?: Date;
}

// Custom input with calendar icon - allows typing
const CustomInput = forwardRef<HTMLInputElement, { 
  value?: string; 
  onClick?: () => void; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}>(
  ({ value, onClick, onChange, placeholder }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-3 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <HiOutlineCalendar 
        onClick={onClick}
        className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors" 
      />
    </div>
  )
);
CustomInput.displayName = 'CustomInput';

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholder = 'Select date...',
  showMonthYearPicker = false,
  dateFormat = 'MM/dd/yyyy',
  maxDate,
  minDate,
}) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholder}
      showMonthYearPicker={showMonthYearPicker}
      dateFormat={dateFormat}
      maxDate={maxDate}
      minDate={minDate}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      customInput={<CustomInput placeholder={placeholder} />}
      calendarClassName="dark-calendar"
      wrapperClassName="w-full max-w-[180px]"
      // Allow typing dates manually
      strictParsing={false}
      // Show full year navigation
      showYearPicker={false}
      // Better year navigation
      scrollableMonthYearDropdown
    />
  );
};

export default DatePicker;

