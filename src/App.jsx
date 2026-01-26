import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import HoF from "./pages/Hof.jsx";
import WBC from "./pages/Wbc.jsx";
import WbcMonthSelect from "./pages/WbcMonthSelect.jsx";
import Nav from "./components/ui/Nav";
import ScrollToTop from "./components/ui/ScrollToTop";
import Footer from "./components/Footer.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WinnerProfileWbc from "./pages/WinnerProfileWbc";
import WinnerProfile from "./pages/WinnerProfile";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Cinematic background wrapper */}
      <div className="rs-cinema min-h-screen flex flex-col text-zinc-100">
        <Nav />

        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hof" element={<HoF />} />
            <Route path="/wbc/select" element={<WbcMonthSelect />} />
            <Route path="/wbc" element={<WBC />} />
            <Route
              path="/wbc/winner/:personKey"
              element={<WinnerProfileWbc />}
            />
            <Route path="/winner/:key" element={<WinnerProfile />} />

            {/* Admin */}
            <Route
              path="/redstoney-room/login"
              element={<AdminLogin />}
            />
            <Route
              path="/redstoney-room"
              element={<AdminDashboard />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<div className="p-6">Not Found</div>}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
