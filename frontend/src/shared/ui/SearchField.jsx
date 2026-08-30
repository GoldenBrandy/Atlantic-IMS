import { forwardRef } from 'react';
import { Search, X, LoaderCircle } from 'lucide-react';
import clsx from 'clsx';

const baseStyles = 'search flex items-center rounded-xl px-3 transition-all border';

const sizeStyle = {
    sm: 'h-9 text-sm',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
}; 

const variantStyles = {
    filled: 'bg-neutral-100 border-transparent hover:border-(--primary-950)/40 focus-within:border-(--primary-950) focus-within:bg-white',
    outlined: 'bg-transparent border-neutral-200 hover:border-(--primary-950)/40 focus-within:border-(--primary-950)',
};

const SearchField = forwardRef(
    (
        {
            value = '',
            placeholder = 'Buscar...',
            onChange = () => {},
            onSubmit,
            onClear = () => {},
            size = 'md',
            variant = 'filled',
            fullWidth = false,
            disabled = false,
            loading = false,
            error = false,
            name = 'search',
            ariaLabel = 'Campo de búsqueda',
            autoComplete = 'off',
            icon,
            className,
        },
        ref,
    ) => {
        const SearchIcon = icon || Search;
        const handleClear = () => {
            onChange('');
            onClear();
        };

        const handleSubmit = (event) => {
            event.preventDefault();
            if (disabled || loading) return;
            onSubmit?.(value);
        };

        return (
            <form onSubmit={handleSubmit} className={clsx(baseStyles, sizeStyle[size] ?? sizeStyle.md, variantStyles[variant] ?? variantStyles.filled, fullWidth && "w-full", disabled && "opacity-60 pointer-events-none", error && "border-red-500 focus-within:border-red-500", className)}>
                {loading ? <LoaderCircle className="size-4 shrink-0 animate-spin text-neutral-500" /> : <SearchIcon className="size-4 shrink-0 text-neutral-500" />}
                <input ref={ref} type="search" name={name} value={value} disabled={disabled} placeholder={placeholder} aria-label={ariaLabel} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} className="search_input flex-1 bg-transparent px-2 outline-none" />

                {!!value && !disabled && (
                    <button type="button" onClick={handleClear} aria-label="Limpiar busqueda" className="search_clear rounded-full p-1 hover:bg-neutral-200">
                        <X className="size-4 text-neutral-500" />
                    </button>
                )}
            </form>
        );
    },
);

SearchField.displayName = 'SearchField';
export default SearchField;