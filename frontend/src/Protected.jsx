import { auth } from "./Firebase";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
