import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home/Home";
import { DynamicLayout } from "./layouts/DynamicLayout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* <Route
            path="/"
            element={
              <DynamicLayout layout="home">
                <Home />
              </DynamicLayout>
            }
          /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
