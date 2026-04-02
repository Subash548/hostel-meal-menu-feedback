import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neo-bg disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-neo-primary text-white hover:bg-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] focus:ring-blue-500",
        secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700",
        danger: "bg-red-500 text-white hover:bg-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] focus:ring-red-500",
        ghost: "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
