import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Index as HomePage } from "./pages/home";
import { Index as LoginPage } from "./pages/login";
import { Index as RegisterPage } from "./pages/register";
import { index as JobListPage } from "./pages/job";
import { index as JobDetailPage } from "./pages/job/job-detail";
import { index as CompanyListPage } from "./pages/company";
import { index as CompanyDetailPage } from "./pages/company/company-detail";

function App() {
  return (
    <>
      <PrimeReactProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Job */}
            <Route
              path="/job"
              element={
                <MainLayout>
                  <JobListPage />
                </MainLayout>
              }
            />
            <Route
              path="/job/:jobName"
              element={
                <MainLayout>
                  <JobDetailPage />
                </MainLayout>
              }
            />

            {/* Company */}
            <Route
              path="/company"
              element={
                <MainLayout>
                  <CompanyListPage />
                </MainLayout>
              }
            />
            <Route
              path="/company/:companyName"
              element={
                <MainLayout>
                  <CompanyDetailPage />
                </MainLayout>
              }
            />

            {/* Employer Dashboard */}
            <Route
              path="/company"
              element={
                <MainLayout>
                  <CompanyListPage />
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </PrimeReactProvider>
    </>
  );
}

export default App;
