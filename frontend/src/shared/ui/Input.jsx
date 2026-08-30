export default function Input({
    label,
    type = "text",
    error,
    startAdornment,
    endAdornment,
    required = false,
    dense = false,
    labelClassName,
    ...props
}) {
    const heightClass = dense ? 'h-10' : 'h-12';

    return (
        <div className='w-full'>
            {label && (
                <label className={labelClassName ?? `block text-caption mb-1 w-full text-left place-self-start ${error ? "text-red-800" : "text-text-primary"}`}>
                    {label}
                    {required && <span className="text-red-600!"> *</span>}
                </label>
            )}
            <div className={`relative ${heightClass} flex items-center`}>
                <div className='absolute inset-0' onMouseDown={(event) => {
                    event.preventDefault(); event.currentTarget.nextElementSibling?.focus(); }}/>
                {startAdornment && <div className='absolute left-3 flex items-center text-neutral-400'>{startAdornment}</div>}
                <input type={type} className={`relative w-full ${heightClass} rounded-md border px-4 text-base transition-colors focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-500 ${startAdornment ? "pl-11" : ""} ${endAdornment ? "pr-11" : ""} ${error ? "border-red-800 hover:border-red-800 focus:border-[3px] focus:border-red-800" : "border-border hover:border-(--primary-950) hover:border-2 focus:border-[3px] focus:border-(--primary-950)"}`} {...props} />

                {endAdornment && <div className='absolute right-3 flex items-center'>{endAdornment}</div>}
            </div>
            {error && <p className="mt-1 w-full text-left text-caption text-red-800">{error}</p>}
        </div>
    );
}
