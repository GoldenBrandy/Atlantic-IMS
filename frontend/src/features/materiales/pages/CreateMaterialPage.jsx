import { useSearchParams } from 'react-router-dom';
import MaterialRegisterForm from '../components/MaterialRegisterForm';
import { MATERIAL_TYPE_SLUGS } from '../services/materialTypeService';

export default function CreateMaterialPage(props) {
    const [searchParams] = useSearchParams();
    const tipo = searchParams.get('tipo');
    const fixedType = tipo ? (MATERIAL_TYPE_SLUGS[tipo.toLowerCase()] ?? null) : null;
    const listUrl = tipo ? `/dashboard/materiales?tipo=${tipo}` : '/dashboard/materiales';

    return (
        <div>
            <MaterialRegisterForm
                {...props}
                fixedType={fixedType}
                nextTo={listUrl}
                cancelTo={listUrl}
                backTo={listUrl}
            />
        </div>
    );
}
