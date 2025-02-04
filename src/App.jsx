import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index as HomePage } from "./pages/home";
import { Index as LoginPage } from "./pages/login";
import { Index as RegisterPage } from "./pages/register";
import { index as JobListPage } from "./pages/job-list";
import { index as JobDetail } from "./pages/job-list/job-detail";
import { MainLayout } from "./layouts/MainLayout";

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
                  <JobDetail />
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
