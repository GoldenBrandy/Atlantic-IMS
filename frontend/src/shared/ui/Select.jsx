export default function Select({
    label,
    name,
    options = [],
    error,
    startAdornment,
    required = false,
    dense = false,
    labelClassName,
    ...props
}) {
    const heightClass = dense ? 'h-10' : 'h-12';

    return (
        <div className='w-full'>
            {label && (
                <label className={labelClassName ?? `block text-caption mb-1 w-full text-left ${error ? "text-red-800" : "text-text-secondary"}`}>
                    {label}
                    {required && <span className="text-red-600!"> *</span>}
                </label>
            )}
            <div className={`relative ${heightClass} flex items-center`}>
                {startAdornment && <div className='absolute left-3 z-10 flex items-center text-neutral-400'>{startAdornment}</div>}
                <select name={name} className={`w-full ${heightClass} rounded-md border px-4 transition-colors focus:outline-none focus:ring-0 ${startAdornment ? "pl-11" : ""} ${error ? "border-red-800 hover:border-red-800 focus:border-[3px] focus:border-red-800" : "border-border hover:border-(--primary-950) hover:border-2 focus:border-[3px] focus:border-(--primary-950)"}`} {...props}>
                    {(options || []).map((opt) => {
                        const isString = typeof opt === 'string';
                        const value = isString ? opt : opt.value ?? opt?.id ?? "";
                        const labelText = isString ? opt : opt?.label ?? opt?.id ?? "";
                        const key = isString ? opt : opt?.id ?? opt?.value ?? value;
                        return <option key={key} value={value}>{labelText}</option>
                    })}
                </select>
            </div>
            {error && <p className='mt-1 w-full text-left text-caption text-red-800'>{error}</p>}
        </div>
    );
}