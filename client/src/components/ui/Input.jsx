import React from 'react';

const Input = ({ label, type = "text", value, onChange, placeholder, required = false, className = "" }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2.5 border border-slate-700 rounded-md focus:outline-none focus:border-neo-accent focus:ring-1 focus:ring-neo-accent transition-all duration-300 bg-slate-800/50 text-slate-100 placeholder-slate-500"
            />
        </div>
    );
};

export default Input;
