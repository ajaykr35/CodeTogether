// frontend/src/App.jsx
// Navbar upar, Footer neeche, beech mein Routes ke hisaab se page badalta hai.

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ye do pages agle steps mein poore banenge */}
        <Route path="/rooms/new" element={<ComingSoon title="Create Room" />} />
        <Route path="/rooms/join" element={<ComingSoon title="Join Room" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;