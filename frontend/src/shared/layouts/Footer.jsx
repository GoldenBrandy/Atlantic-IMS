export default function Footer({
    children,
}) {
    return (
        <footer className="w-full border-t border-slate-200 px-4 py-4 text-sm text-slate-600">
            {children ?? null}
        </footer>
    );
}