import { PrimeReactProvider } from "primereact/api";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Index as HomePage } from "./pages/home";
import { index as NotFoundPage } from "./pages/404-not-found";
import { Index as LoginPage } from "./pages/login";
import { Index as RegisterPage } from "./pages/register";
import { index as ConfirmEmailPage } from "./pages/confirm-email";
import { index as JobListPage } from "./pages/job-list";
import { index as JobDetailPage } from "./pages/job-list/job-detail";
import { index as CompanyListPage } from "./pages/company-list";
import { index as CompanyDetailPage } from "./pages/company-list/company-detail";
import { index as CandidateListPage } from "./pages/candidate-list";
import { index as CandidateDetailPage } from "./pages/candidate-list/candidate-detail";

function App() {
  return (
    <>
      <PrimeReactProvider>
        <ToastContainer />
        <Router>
          <Routes>
            <Route path="*" element={<NotFoundPage />} /> {/* Route 404 */}
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
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            {/* Job */}
            <Route
              path="/job-list"
              element={
                <MainLayout>
                  <JobListPage />
                  {/* <ProtectedRoute requiredRole="1">
                    <JobListPage />
                  </ProtectedRoute> */}
                </MainLayout>
              }
            />
            <Route
              path="/job-list/:jobName"
              element={
                <MainLayout>
                  <JobDetailPage />
                </MainLayout>
              }
            />
            {/* Company */}
            <Route
              path="/company-list"
              element={
                <MainLayout>
                  <CompanyListPage />
                </MainLayout>
              }
            />
            <Route
              path="/company-list/:companyName"
              element={
                <MainLayout>
                  <CompanyDetailPage />
                </MainLayout>
              }
            />
            {/* Candidate */}
            <Route
              path="/candidate-list"
              element={
                <MainLayout>
                  <CandidateListPage />
                </MainLayout>
              }
            />
            <Route
              path="/candidate-list/:candidateName"
              element={
                <MainLayout>
                  <CandidateDetailPage />
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
