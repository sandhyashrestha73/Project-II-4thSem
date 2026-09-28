import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import ComparePackages from "./pages/ComparePackages";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Gallery from "./pages/Gallery";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";


import AgencyDashboard from "./pages/agency/AgencyDashboard";
import AgencyPackages from "./pages/agency/AgencyPackages";
import AgencyGuides from "./pages/agency/AgencyGuides";
import AgencyBookings from "./pages/agency/AgencyBookings";
import AgencyBlog from "./pages/agency/AgencyBlog";
import AgencyGallery from "./pages/agency/AgencyGallery";
import AgencyProfile from "./pages/AgencyProfile";
import Agencies from "./pages/Agencies";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminGallery from "./pages/admin/AdminGallery";

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC SITE
      ===================================================== */}

      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      {/* Normal login - Tourist + Agency only */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      {/* Separate admin login */}
      <Route
        path="/admin_login"
        element={<AdminLogin />}
      />

      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicLayout>
            <ForgotPassword />
          </PublicLayout>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicLayout>
            <ResetPassword />
          </PublicLayout>
        }
      />

      <Route
        path="/destinations"
        element={
          <PublicLayout>
            <Destinations />
          </PublicLayout>
        }
      />

      <Route
        path="/destinations/:id"
        element={
          <PublicLayout>
            <DestinationDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/packages"
        element={
          <PublicLayout>
            <Packages />
          </PublicLayout>
        }
      />

      <Route
        path="/packages/:id"
        element={
          <PublicLayout>
            <PackageDetail />
          </PublicLayout>
        }
      />

        <Route
          path="/compare-packages"
          element={
           <PublicLayout>
            <ComparePackages />
           </PublicLayout>
            }
        />
      <Route
        path="/blog"
        element={
          <PublicLayout>
            <Blog />
          </PublicLayout>
        }
      />

      <Route
        path="/blog/:id"
        element={
          <PublicLayout>
            <BlogDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <Gallery />
          </PublicLayout>
        }
      />

        <Route 
          path="/about" 
          element={
      <PublicLayout>
        <About />
      </PublicLayout>
    } 
  />

    <Route 
      path="/contact" 
      element={
    <PublicLayout>
      <Contact />
    </PublicLayout>
  } 
/>

    <Route 
      path="/privacy-policy" 
      element={
    <PublicLayout>
      <PrivacyPolicy />
    </PublicLayout>
  } 
/>
  <Route
  path="/agencies/:agency_id"
  element={
    <PublicLayout>
      <AgencyProfile />
    </PublicLayout>
  }
/>


  <Route
  path="/agencies"
  element={
    <PublicLayout>
      <Agencies />
    </PublicLayout>
  }
/>
    <Route 
      path="/terms" 
      element={
    <PublicLayout>
      <Terms />
    </PublicLayout>
  } 
/>


      {/* =====================================================
          TOURIST PORTAL
      ===================================================== */}

      <Route
        path="/my-bookings"
        element={
          <PublicLayout>
            <ProtectedRoute allowedRoles={["tourist"]}>
              <MyBookings />
            </ProtectedRoute>
          </PublicLayout>
        }
      />

      {/* =====================================================
          AGENCY PORTAL
      ===================================================== */}

      <Route
        path="/agency/dashboard"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agency/packages"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyPackages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agency/guides"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyGuides />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agency/bookings"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agency/blog"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyBlog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agency/gallery"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyGallery />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN PORTAL
      ===================================================== */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/destinations"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDestinations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/packages"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPackages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blog"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBlog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/gallery"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminGallery />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />

    </Routes>
  );
}