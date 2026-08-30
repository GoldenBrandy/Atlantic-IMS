export default function UserFeatureIconAction({
    children,
    type = 'button',
    ...props
}) {
    return <button type={type} {...props}>{children}</button>;
}