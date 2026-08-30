import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export default function Switch({
    checked = false,
    onChange,
    disable = false,
    disabled,
    size = 'md',
    className = '',
}) {
    const [isActive, setIsActive] = useState(checked);
    const isDisabled = disabled ?? disable;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsActive(checked);
    }, [checked]);

    const handleToggle = () => {
        if (isDisabled) return;
        const newValue = !isActive;
        setIsActive(newValue);
        onChange?.(newValue);
    };

    const sizes = { sm: "h-5 w-9", md: "h-6 w-11", lg: "h-7 w-14" };
    const knobSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

    return (
        <button type="button" role="switch" aria-checked={isActive} onClick={handleToggle} disabled={isDisabled} className={`relative inline-flex shrink-0 items-center rounded-full border-0 p-0 align-middle transition-colors ${sizes[size] ?? sizes.md} ${isActive ? "bg-green-500" : "bg-gray-300"} ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
            <span className={`absolute left-0.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${knobSizes[size] ?? knobSizes.md} ${isActive ? "translate-x-full" : "translate-x-0"}`}>
                {isActive ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-gray-500" />}
            </span>
        </button>
    );
}