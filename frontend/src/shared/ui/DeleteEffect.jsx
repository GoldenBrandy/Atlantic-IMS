import { useEffect, useState } from 'react';

export default function DeleteEffect() {
    const [message, setMessage] = useState('Cargando...');
    useEffect(() => {
        const timerId = setTimeout(() => {
            setMessage("Componente cargado");
        }, 2000);

        return () => clearTimeout(timerId);
    }, []);
    return <h1>{message}</h1>;
}