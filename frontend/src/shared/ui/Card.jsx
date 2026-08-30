export default function Card({
    product,
}) {
    const { tittle, price, description, image } = product;

    return (
        <div className='w-full rounded-xl overflow-hidden bg-white/10 text-text-inverse dark:bg-neutral-950/80 dark:text-white transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 hover:ring-1 hover:ring-white/10'>
            <img src={image} alt={tittle} className='w-full h-48 object-contain' />
            <div className='p-5 space-y-3'>
                <h2 className='text-h2 font-heading place-self-center'>{tittle}</h2>
                <p className="text-body">{description}</p>
                <p className="text-h2 font-heading text-brand">${Number(price).toLocaleString()}</p>
            </div>
        </div>
    );
}