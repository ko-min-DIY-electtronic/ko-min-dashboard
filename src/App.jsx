import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PrivateRoute from "./PrivateRoute";
import { Toaster } from "sonner";
import LoginPage from "./components/auth/LoginPage";

export default function App() {
  return (
    <>
      <Router>
        <Toaster
          position="bottom-left"
          richColors
          duration={2000}
          closeButton
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              // <PrivateRoute>
              <Home />
              // </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}
