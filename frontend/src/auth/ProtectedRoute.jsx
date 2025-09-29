import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../pages/Loader.jsx';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, roles = [], requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user has required role or admin status
  const hasRequiredRole = roles.length === 0 || 
    (user && roles.includes(user.role)) || 
    (requireAdmin && isAdmin()) || 
    (!requireAdmin && user); // Allow any authenticated user if no roles specified

  if (!isAuthenticated) {
    console.log('Redirecting to /login: User not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    console.log('Redirecting to /unauthorized: User lacks required role or admin status', {
      userRole: user?.role,
      requiredRoles: roles,
      isAdmin: isAdmin()
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // Render children instead of Outlet
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  requireAdmin: PropTypes.bool,
};

export default ProtectedRoute;