export default function userFeatureButton({
    children,
    type = 'button',
    ...props
}) {
    return <button type={type} {...props}>{children}</button>;
}