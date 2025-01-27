import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index as HomePage } from "./pages/home";
import { Index as LoginPage } from "./pages/login";
import { Index as RegisterPage } from "./pages/register";
import { DynamicLayout } from "./layouts/DynamicLayout";

function App() {
  return (
    <>
      <PrimeReactProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <DynamicLayout layout="home">
                  <HomePage />
                </DynamicLayout>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Router>
      </PrimeReactProvider>
    </>
  );
}

export default App;
