import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Landing } from "@/pages/Landing";
import { Estimate } from "@/pages/Estimate";
import { Tracking } from "@/pages/Tracking";
import { FAQ } from "@/pages/FAQ";
import { Contact } from "@/pages/Contact";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { TravelerDashboard } from "@/pages/TravelerDashboard";
import { Admin } from "@/pages/Admin";
import { NotFound } from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter basename="/Kaygo">
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/estimation" element={<Estimate />} />
            <Route path="/suivi" element={<Tracking />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/voyageur" element={<TravelerDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}