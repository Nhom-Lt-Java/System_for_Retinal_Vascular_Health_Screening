import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export default function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl 
            ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5
            focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 
            hover:border-primary-300
            outline-none transition-all duration-200 ease-in-out font-medium
            placeholder:text-slate-400
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}