import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import AdminDashboard from './admin/AdminDashboard.jsx';
import Profile from './pages/Profile';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import { Logout } from './auth/Logout';
import { ForgotPassword } from './auth/ForgotPassword';
import About from './home/About';
import Categories from './home/Categories';
import Explore from './home/Explore';
import MyPostPage from './home/MyPostPage';
import TrendingDetails from './home/TrendingDetails';
import AuthLayout from './auth/authLayout.jsx';
import Footer from './pages/Footer.jsx';
import Navbar from './pages/Navbar.jsx';

// Layout component to conditionally render Navbar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Routes that should not have the main layout (Navbar + Footer)
  const noLayoutRoutes = ['/admin'];
  
  // Check if current route should have layout
  const shouldShowLayout = !noLayoutRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  if (!shouldShowLayout) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" aria-label="Main application container">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/trending" element={<TrendingDetails />} />
              <Route path="/my-posts" element={<MyPostPage />} />
              <Route path="/create-blog" element={<CreateBlog />} />
              <Route path="/profile" element={<Profile />} />

              {/* Authentication Routes with AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/logout" element={<Logout />} />
              </Route>

              {/* Protected Routes */}
              <Route
                path="/edit-blog"
                element={
                  <ProtectedRoute>
                    <EditBlog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <div>Notifications Page (Placeholder)</div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - No Layout */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;