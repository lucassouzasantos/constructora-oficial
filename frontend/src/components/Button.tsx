import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg";

        const variants = {
            primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 focus:ring-orange-500",
            secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-800",
            danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 focus:ring-red-500",
            ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-500",
            outline: "bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-500"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base",
            icon: "p-1.5"
        };

        const isIconOnly = size === 'icon';

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {isLoading && (
                    <Loader2 className={`animate-spin ${isIconOnly ? '' : 'mr-2'} h-4 w-4`} />
                )}
                {!isLoading && leftIcon && (
                    <span className={isIconOnly ? "" : "mr-2"}>{leftIcon}</span>
                )}

                {children}

                {!isLoading && rightIcon && (
                    <span className={isIconOnly ? "" : "ml-2"}>{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
