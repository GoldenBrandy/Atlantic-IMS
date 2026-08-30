import UserRegisterForm from "../components/UserRegisterForm";

export default function CreateUserPage(props) {
  return (
    <div className="w-full flex justify-center">
      <UserRegisterForm {...props} />
    </div>
  );
}