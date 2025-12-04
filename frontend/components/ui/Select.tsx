'use client';

import React from 'react';
import ReactSelect, { StylesConfig, GroupBase } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
}

// Custom dark theme styles for react-select
const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgb(30 41 59)', // slate-800
    borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(51 65 85)', // blue-500 : slate-700
    borderRadius: '0.375rem',
    minHeight: '38px',
    boxShadow: state.isFocused ? '0 0 0 1px rgb(59 130 246)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(71 85 105)', // blue-500 : slate-600
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(30 41 59)', // slate-800
    border: '1px solid rgb(51 65 85)', // slate-700
    borderRadius: '0.375rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    zIndex: 50,
    marginTop: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '200px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? 'rgb(59 130 246)' // blue-500
      : state.isFocused 
        ? 'rgb(51 65 85)' // slate-700
        : 'transparent',
    color: state.isSelected ? 'white' : 'rgb(226 232 240)', // slate-200
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    '&:active': {
      backgroundColor: 'rgb(59 130 246)', // blue-500
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
    fontSize: '0.875rem',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(100 116 139)', // slate-500
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    color: 'white',
    fontSize: '0.875rem',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? 'rgb(59 130 246)' : 'rgb(100 116 139)', // blue-500 : slate-500
    padding: '0 8px',
    '&:hover': {
      color: 'rgb(59 130 246)', // blue-500
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgb(100 116 139)', // slate-500
    padding: '0 8px',
    '&:hover': {
      color: 'rgb(248 113 113)', // red-400
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgb(100 116 139)', // slate-500
    fontSize: '0.875rem',
  }),
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isSearchable = true,
  isClearable = false,
}) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <ReactSelect
      options={options}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      styles={customStyles}
      classNamePrefix="select"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
    />
  );
};

export default Select;

