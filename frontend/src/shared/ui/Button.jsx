export default function Button({
    variant = 'primary',
    size = 'base',
    type = 'button',
    children,
    className = "",
    ...props
}) {
    const variants = {
        primary: 'bg-[color:var(--primary-950)] border border-[color:var(--primary-950)] text-white hover:bg-[color:var(--primary-800)] hover:text-white',

        secondary: 'bg-white border border-[color:var(--primary-950)] text-[color:var(--primary-950)] hover:bg-[color:var(--primary-950)] hover:text-white',
    };

    const sizes = {
        base: 'h-auto w-auto px-4 py-1.5 text-medium',
        sm: 'h-auto w-auto px-3 py-1 text-small',
        md: 'h-auto w-auto px-5 py-2 text-medium',
    };

    const variantClasses = variants[variant] ?? variants.primary;
    const sizeClasses = sizes[size] ?? sizes.base;

    return (
        <button className={`inline-flex items-center justify-center rounded-md cursor-pointer transition-colors duration-200 ${variantClasses} ${sizeClasses} ${className}`} type={type} {...props}>
            {children}
        </button>
    );
}