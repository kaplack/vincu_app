import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slice/authSlice";

export default function LogoutButton({
  className = "",
  children = "Cerrar sesión",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
