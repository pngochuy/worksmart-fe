import { PrimeReactProvider } from "primereact/api";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Index as HomePage } from "@/pages/home";
import { index as NotFoundPage } from "@/pages/404-not-found";
import { Index as LoginPage } from "@/pages/login";
import { Index as RegisterPage } from "@/pages/register";
import { Index as ForgotPasswordPage } from "@/pages/forgot-password";
// import { Index as ForgotPasswordPage } from "@/pages/forgot-password/index.jsx";
// import { Index as VerifyOTPPage } from "@/pages/forgot-password";
// import { Index as ResetPasswordPage } from "@/pages/forgot-password";
import { index as ContactPage } from "@/pages/contact";
import { index as ConfirmEmailPage } from "@/pages/confirm-email";
import { Index as JobListPage } from "@/pages/job-list";
import { Index as JobDetailPage } from "@/pages/job-list/job-detail";
import { Index as SuitableJobPage } from "@/pages/suitable-jobs-ex";
import { Index as CompanyListPage } from "@/pages/company-list";
import { Index as CompanyDetailPage } from "@/pages/company-list/company-detail";
import { Index as CandidateListPage } from "@/pages/candidate-list";
import { index as CandidateDetailPage } from "@/pages/candidate-list/candidate-detail";
import { Index as SuitableJobsPage } from "@/pages/suitable-jobs";
import { UserLayout } from "@/layouts/UserLayout";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";
import SavedJobsPage from "@/pages/dashboard-candidate/saved-jobs";
// Candidate Pages
import { Index as CandidateDashboardPage } from "@/pages/dashboard-candidate";
import { Index as MyProfilePage } from "@/pages/dashboard-candidate/my-profile";
import { index as MyCVPage } from "@/pages/dashboard-candidate/my-cv";
import { index as CreateCVPage } from "@/pages/dashboard-candidate/my-cv/create-cv";
import { index as AppliedJobsPage } from "@/pages/dashboard-candidate/applied-jobs";
import { Index as CategoryTagsManagerPage } from "@/pages/dashboard-candidate/category-tag-management";
import { index as JobAlertsPage } from "@/pages/dashboard-candidate/job-alerts";
// import { index as SavedJobsPage } from "@/pages/dashboard-candidate/saved-jobs";
import { index as CandidateSubscriptionPlansPage } from "@/pages/dashboard-candidate/subscription-plans";
import { Index as CandidateTransactionHistoryPage } from "@/pages/dashboard-candidate/transaction-history";
import { Index as CandidateNotificationsPage } from "@/pages/dashboard-candidate/notifications";
import { Index as CandidateChangePasswordPage } from "@/pages/dashboard-candidate/change-password";
import { Index as CandidateSettingPage } from "@/pages/dashboard-candidate/settings";
import CandidatePackagePurchase from "@/pages/dashboard-candidate/package/PackagePurchase";
import CandidatePaymentResult from "@/pages/dashboard-candidate/package/PackageResult";
import CandidatePaymentCancel from "@/pages/dashboard-candidate/package/PackageCancel";
//message Page
import { Index as MessagesPage } from "@/pages/dashboard-candidate/messages";
// Employer Pages
import { Index as EmployerDashboardPage } from "@/pages/dashboard-employer";
import { Index as CompanyProfilePage } from "@/pages/dashboard-employer/company-profile";
import { Index as PostJobPage } from "@/pages/dashboard-employer/post-job";
import ManageJobsPage from "@/pages/dashboard-employer/manage-jobs";
import EditJobPage from "@/pages/dashboard-employer/manage-jobs/edit-job";
import { index as EmployerSubscriptionPlansPage } from "@/pages/dashboard-employer/subscription-plans";
import { Index as EmployerTransactionHistoryPage } from "@/pages/dashboard-employer/transaction-history";
import { Index as EmployerNotificationsPage } from "@/pages/dashboard-employer/notifications";
import { Index as EmployerChangePasswordPage } from "@/pages/dashboard-employer/change-password";
import { Index as AllCandidatesPage } from "@/pages/dashboard-employer/all-candidates";
import { Index as ProposedCVsPage } from "@/pages/dashboard-employer/proposed-cvs";
import { index as ShortlistedCVsPage } from "@/pages/dashboard-employer/shortlisted-cvs";
import VerificationForm from "@/pages/dashboard-employer/verification/VerificationForm";
import VerifyTax from "@/pages/dashboard-employer/verification/VerifyTax";
import BusinessLicense from "@/pages/dashboard-employer/verification/BusinessLicense";
import UploadFileTest from "@/pages/dashboard-employer/upload-file/UploadFileTest";
import CandidatesPage from "@/pages/dashboard-employer/manage-jobs/CandidatesPage";
import EmployerPackagePurchase from "@/pages/dashboard-employer/package/PackagePurchase";
import EmployerPaymentResult from "@/pages/dashboard-employer/package/PaymentResult";
import EmployerPaymentCancel from "@/pages/dashboard-employer/package/PaymentCancel";
import { Index as EmployerSettingPage } from "@/pages/dashboard-employer/settings";

// Admin Pages
import { AdminLayout } from "@/layouts/AdminLayout";
import { Index as AdminDashboardPage } from "@/pages/dashboard-admin";
import { Index as UsersManagementPage } from "@/pages/dashboard-admin/users-management";
import { Index as JobPostingsManagementPage } from "@/pages/dashboard-admin/job-postings-management";
import { Index as ReportsPage } from "@/pages/dashboard-admin/reports";
import { FreePlanSettings } from "@/pages/dashboard-admin/settings/FreePlanSettings";
import { Index as SubscriptionPlansPage } from "@/pages/dashboard-admin/subscription-plans-management";
import { Index as TransactionsPage } from "@/pages/dashboard-admin/transactions";

import EmployerCandidateDetailPage from "@/pages/dashboard-employer/manage-jobs/EmployerCandidateDetailPage";
// import ProposedCandidates from "@/pages/dashboard-employer/proposed-cvs/job";
import CandidateMatchingPage from "@/pages/dashboard-employer/proposed-cvs/job";
function App() {
  return (
    <>
      <PrimeReactProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
        />
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
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
              path="/job-list/:jobId"
              element={
                <MainLayout>
                  <JobDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/suitable-job-ex"
              element={
                <MainLayout>
                  <SuitableJobPage />
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
                <ProtectedRoute requiredRoleId="Employer">
                  <MainLayout>
                    <CandidateListPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate-list/:candidateName"
              element={
                <ProtectedRoute requiredRoleId="Employer">
                  <MainLayout>
                    <CandidateDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Suitable Jobs */}
            <Route
              path="/suitable-jobs"
              element={
                <ProtectedRoute requiredRoleId="Candidate">
                  <MainLayout>
                    <SuitableJobsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Contact */}
            <Route
              path="/contact"
              element={
                <MainLayout>
                  <ContactPage />
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
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="my-profile"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <MyProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                index
                path="demo-list-cvs"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CreateCVLayout>
                      <DemoListCVsPage />
                    </CreateCVLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="demo-edit-cv"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CreateCVLayout>
                      <DemoEditorCVPage />
                    </CreateCVLayout>
                  </ProtectedRoute>
                }
              /> */}
              <Route
                index
                path="my-cv"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <MyCVPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                index
                path="my-cv/edit"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CreateCVPage />
                    {/* <CreateCVLayout>
                      <EditorCVPage />
                    </CreateCVLayout> */}
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="saved-jobs"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="applied-jobs"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <AppliedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="category-tag-management"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CategoryTagsManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="job-alerts"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <JobAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="saved-jobs"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="subscription-plans"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateSubscriptionPlansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="messages"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="notifications"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="change-password"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="settings"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateSettingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="transaction-history"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidateTransactionHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="package-list"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidatePackagePurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="payment-return"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidatePaymentResult />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="payment-cancel"
                element={
                  <ProtectedRoute requiredRoleId="Candidate">
                    <CandidatePaymentCancel />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Employer */}
            <Route path="/employer" element={<UserLayout />}>
              <Route
                index
                path="dashboard"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="company-profile"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <CompanyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="post-job"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/employer" element={<UserLayout />}>
                <Route path="job-list" element={<JobListPage />} />
              </Route>
              <Route
                path="/employer/manage-jobs/edit/:jobId"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EditJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/manage-jobs/applied-candidates/:jobId"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <CandidatesPage />
                  </ProtectedRoute>
                }
              />
              {/* ThanhAdd page candidares*/}
              <Route
                path="/employer/manage-jobs/candidates/:jobId"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <CandidatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/manage-jobs/candidates/:jobId/:candidateId"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerCandidateDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="manage-jobs"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <ManageJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="proposed-cvs"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <ProposedCVsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="proposed-cvs/jobs/:jobId/candidates"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <CandidateMatchingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="all-candidates"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <AllCandidatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="shortlisted-cvs"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <ShortlistedCVsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="subscription-plans"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerSubscriptionPlansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="transaction-history"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerTransactionHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="messages"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="notifications"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="change-password"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="verification"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <VerificationForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="verify-tax"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <VerifyTax />
                  </ProtectedRoute>
                }
              />
              <Route
                path="business-license"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <BusinessLicense />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="/employer/upload-file-test"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <UploadFileTest />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="package-list"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerPackagePurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="payment-return"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerPaymentResult />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="payment-cancel"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerPaymentCancel />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="settings"
                element={
                  <ProtectedRoute requiredRoleId="Employer">
                    <EmployerSettingPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                path="dashboard"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="users-management"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="job-postings-management"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <JobPostingsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="reports"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="transactions"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="subscription-plans-management"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <SubscriptionPlansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                index
                path="settings"
                element={
                  <ProtectedRoute requiredRoleId="Admin">
                    <FreePlanSettings />
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
