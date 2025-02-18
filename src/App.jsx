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
import { UserLayout } from "./layouts/UserLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { index as CandidateDashboardPage } from "./pages/dashboard-candidate";
import { index as MyProfilePage } from "./pages/dashboard-candidate/my-profile";
import { index as MyCVPage } from "./pages/dashboard-candidate/my-cv";
import { index as CreateCVPage } from "./pages/dashboard-candidate/my-cv/create-cv";
import { index as AppliedJobsPage } from "./pages/dashboard-candidate/applied-jobs";
import { index as JobAlertsPage } from "./pages/dashboard-candidate/job-alerts";
import { index as SavedJobsPage } from "./pages/dashboard-candidate/saved-jobs";
import { index as SubscriptionPlansPage } from "./pages/dashboard-candidate/subscription-plans";
import { index as MessagesPage } from "./pages/dashboard-candidate/messages";

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
            {/* Protected Route */}
            {/* Candidate */}
            <Route path="/candidate" element={<UserLayout />}>
              <Route
                index
                path="dashboard"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <CandidateDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="my-profile"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <MyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="my-cv"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <MyCVPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="create-cv"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <CreateCVPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="applied-jobs"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <AppliedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="job-alerts"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <JobAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="saved-jobs"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="subscription-plans"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <SubscriptionPlansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="messages"
                element={
                  <ProtectedRoute requiredRoleId="1">
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </PrimeReactProvider>
    </>
  );
}

export default App;
