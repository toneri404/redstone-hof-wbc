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


export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Nav />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hof" element={<HoF />} />
            <Route path="/wbc/select" element={<WbcMonthSelect />} />
            <Route path="/wbc" element={<WBC />} />
            <Route path="*" element={<div className="p-6">Not Found</div>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
