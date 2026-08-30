import GrupoRegisterForm from '../components/GrupoRegisterForm';

export default function CreateGrupoPage(props) {
    return (
        <div className='w-full flex justify-center'>
            <GrupoRegisterForm {...props} />
        </div>
    )
}