import clsx from 'clsx';

export default function IconAction({
    children,
    ariaLabel,
    onClick,
    disabled = false,
    destructive = false,
    className = "",
    ...props
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            disabled={disabled}
            className={clsx("inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50", destructive ? "border-red-200 text-red-700 hover:bg-red-50" : "border-slate-200 text-slate-700 hover:bg-slate-50", className)}
            {...props}
        >
            {children}
        </button>
    );
}