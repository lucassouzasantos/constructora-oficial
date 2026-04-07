import { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value: string | number;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function CurrencyInput({ value, onValueChange, placeholder, className, required }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value === '' || value === undefined || value === null) {
            setDisplayValue('');
            return;
        }
        // Format initial value
        const num = Number(value);
        if (!isNaN(num)) {
            setDisplayValue(new Intl.NumberFormat('es-PY').format(num));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits
        const rawValue = e.target.value.replace(/\D/g, '');

        if (rawValue === '') {
            onValueChange('');
            setDisplayValue('');
            return;
        }

        const numericValue = Number(rawValue);
        onValueChange(String(numericValue));

        // Format for display
        setDisplayValue(new Intl.NumberFormat('es-PY').format(numericValue));
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className={className || "w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"}
        />
    );
}
