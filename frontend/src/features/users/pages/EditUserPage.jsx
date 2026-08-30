import UserRegisterForm from "../components/UserRegisterForm";
import { useParams, useSearchParams } from "react-router-dom";

export default function EditUserPage(props) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isRenewal = searchParams.get("renovar") === "true";
  return (
    <div className="w-full flex justify-center">
      <UserRegisterForm
        {...props}
        userId={id}
        isRenewal={isRenewal}
        showBackButton={true}
        backTo="/dashboard/users"
        nextTo="/dashboard/users"
      />
    </div>
  );
}
