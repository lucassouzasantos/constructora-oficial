import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
                            w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm transition-all outline-none
                            ${icon ? 'pl-10' : ''}
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                            }
                            ${props.disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
