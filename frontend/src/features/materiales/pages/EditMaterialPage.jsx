import MaterialRegisterForm from "../components/MaterialRegisterForm";
import { useParams } from "react-router-dom";

export default function EditMaterialPage(props) {
    const { id } = useParams();

    return (
        <div className="w-full flex justify-center">
            <MaterialRegisterForm {...props} materialId={id} showBackButton={true} backTo="/dashboard/materiales" nextTo="/dashboard/materiales" />
        </div>
    )
}