import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'default', size = 'sm', children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider rounded-full border";

        const variants = {
            success: "bg-green-100 text-green-700 border-green-200",
            warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
            error: "bg-red-100 text-red-700 border-red-200",
            info: "bg-blue-100 text-blue-700 border-blue-200",
            default: "bg-slate-100 text-slate-700 border-slate-200"
        };

        const sizes = {
            sm: "px-2 py-0.5 text-[10px] uppercase",
            md: "px-2.5 py-1 text-xs"
        };

        return (
            <span
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
