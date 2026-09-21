import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Reports from "./pages/Reports/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin/Admin";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import Layout from "./components/layout/Layout";
import Worker from "./pages/Worker/Worker";
import WorkerToday from "./pages/WorkerToday/WorkerToday";

function App() {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (user?.role === "worker") {
      return "/worker";
    }

    return "/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            ANA SAYFA
        ================================================== */}

        <Route
          path="/"
          element={<Navigate to={getHomeRoute()} replace />}
        />

        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? (
              <Navigate to={getHomeRoute()} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* ==================================================
            DASHBOARD
            ADMIN + MANAGER
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            RAPORLAR
            ADMIN + MANAGER
        ================================================== */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN PANELİ
            SADECE ADMIN
        ================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            KULLANICI YÖNETİMİ
            SADECE ADMIN
        ================================================== */}

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            WORKER PANELİ
            ADMIN + MANAGER + WORKER
        ================================================== */}

        <Route
          path="/worker"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "manager", "worker"]}
            >
              <Layout>
                <Worker />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            WORKER BUGÜN
            ADMIN + MANAGER + WORKER
        ================================================== */}

        <Route
          path="/worker/today"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "manager", "worker"]}
            >
              <Layout>
                <WorkerToday />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            TANIMSIZ ADRESLER
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to={getHomeRoute()} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;