// ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, role }) => {
const { user } = useAuth();

if (!user) {
    return <Navigate to="/login" />;
}

const allowedRoles = role.split('|');
  if (role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

return children;
};

export default ProtectedRoute;