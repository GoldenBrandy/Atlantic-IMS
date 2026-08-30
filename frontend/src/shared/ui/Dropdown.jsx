import { cloneElement, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownContext } from './DropdownContext';

export function Dropdown({
    children,
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const closeDropdown = (event) => {
            const clickedTrigger = triggerRef.current?.contains(event.target);
            const clickedContent = contentRef.current?.contains(event.target);

            if (!clickedTrigger && !clickedContent) setOpen(false);
        };

        const closeWithEscape = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", closeDropdown);
        document.addEventListener("keydown", closeWithEscape);

        return () => {
            document.removeEventListener("mousedown", closeDropdown);
            document.removeEventListener("keydown", closeWithEscape);
        };
    }, []);

    return (
        <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }} >
            <div className={className} style={{ display: "contents" }}>
                {children}
            </div>
        </DropdownContext.Provider>
    );

}

export function DropdownTrigger({
    children,
}) {
    const { open, setOpen, triggerRef } = useContext(DropdownContext);

    return cloneElement(children, {
        ref: triggerRef,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        onClick: (event) => {
            children.props.onClick?.(event);
            setOpen(!open);
        },
    });
}

export function DropdownContent({
    children,
    className = "",
}) {

    const { open, triggerRef, contentRef } = useContext(DropdownContext);
    const [position, setPosition] = useState({ top: 0, right: 0 });

    // Se ancla por el borde derecho (en vez de calcular "left" asumiendo un
    // ancho fijo) para que el panel quede siempre alineado bajo el trigger
    // sin importar cuanto mida su contenido, y nunca se corte contra el
    // borde derecho de la pantalla.
    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const trigger = triggerRef.current.getBoundingClientRect();
        const pageMargin = 16;
        const right = Math.max(window.innerWidth - trigger.right, pageMargin);
        setPosition({ top: trigger.bottom + window.scrollY + 8, right });
    }, [open, triggerRef]);

    if (!open) return null;

    return createPortal(
        <div ref={contentRef} role="menu" className={`fixed z-110 min-w-48 rounded-xl border border-neutral-200 bg-white p-1 text-neutral-950 shadow-lg shadow-black/10 overflow-hidden ${className}`} style={{ top: position.top, right: position.right }}>
            {children}
        </div>,
        document.body
    );
}

export function DropdownItem({
    children,
    onClick,
    className = "",

}) {
    const { setOpen } = useContext(DropdownContext);
    const itemClasses = `w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-neutral-100 focus:bg-neutral-100 ${className}`;
    const closeAfterClick = (event) => {
        onClick?.(event);
        setOpen(false);
    };

    if (children?.props?.to) {
        return (
            <div role="menuitem" className='w-full'>
                {cloneElement(children, { className: `${children.props.className || ""} block ${itemClasses}`, onClick: (event) => { children.props.onClick?.(event); setOpen(false); } })}
            </div>
        );
    }

    return (
        <button role="menuitem" type="button" onClick={closeAfterClick} className={itemClasses}>
            {children}
        </button>
    );
}