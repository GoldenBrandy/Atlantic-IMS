import { useEffect, useMemo, useRef, useState } from 'react';
import { Infinity as InfinityLoader } from 'ldrs/react';
import 'ldrs/react/Infinity.css';

export default function FileInput({
    value = [],
    onChange,
    multiple = false,
    accept = "image/*,application/pdf",
}) {
    const inputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const isImage = (file) => file.type.startsWith("image/");
    const fileCount = useMemo(() => value.length, [value]);
    const previews = useMemo(() => value.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)), [value]);

    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    const handleFiles = async (files) => {
        if (!files?.length) return;
        setIsLoading(true);
        const list = Array.from(files);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data = multiple ? [...value, ...list] : [list[0]];
        onChange?.(data.slice(0, 12));
        setIsLoading(false);
    };

    const remove = (index) => {
        const copy = [...value];
        copy.splice(index, 1);
        onChange?.(copy);
    };

    const reorder = (from, to) => {
        if (typeof from !== "number") return;
        const copy = [...value];
        const [movedFile] = copy.splice(from, 1);
        copy.splice(to, 0, movedFile);
        onChange?.(copy);
    };

    return (
        <div className='flex items-center gap-2'>
            <span className="text-xs text-gray-500">{fileCount} archivo(s)</span>
            {value.map((file, index) => (
                <div key={`${file.name}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(dragIndex, index)} className="relative w-24 h-24 border rounded overflow-hidden group">
                    {isImage(file) ? <img src={previews[index]} alt={file.name} className='w-full h-full object-cover'/> : <div className='w-full h-full flex flex-col items-center justify-center bg-gray-100 text-[10px] px-1'><span className='truncate w-full text-center'>{file.name}</span></div>}
                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={() => remove(index)} className="w-7 h-7 bg-white rounded-full text-black text-xs">X</button>
                    </div>
                </div>
            ))}
            <div onClick={() => !isLoading && inputRef.current?.click()} className='w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer'>
                {isLoading ? <InfinityLoader size='55' stroke='4' strokeLength='0.15' bgOpacity='0.1' speed='1.3' color='black' /> : <span className='text-blue-500 text-sm'>Seleccionar archivos</span>}
            </div>
            <input ref={inputRef} type="file" hidden multiple={multiple} accept={accept} onChange={(event) => handleFiles(event.target.files)} />
        </div>
    );
}