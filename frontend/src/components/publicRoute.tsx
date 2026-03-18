import { useAppData } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => { // if i authenticated then i will at home page else outlet means login children
  const { isAuth, loading } = useAppData();

  if (loading) return null;

  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
