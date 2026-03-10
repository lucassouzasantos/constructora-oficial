import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import FinancePage from './pages/FinancePage';
import RegistersPage from './pages/RegistersPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import SuppliesPage from './pages/SuppliesPage';
import CustomersPage from './pages/CustomersPage'; // Added this line
import ContractsPage from './pages/ContractsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/registers" element={<RegistersPage />} />
            <Route path="/supplies" element={<SuppliesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
