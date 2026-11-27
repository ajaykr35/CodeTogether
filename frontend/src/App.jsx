// Navbar upar, Footer neeche, beech mein Routes ke hisaab se page badalta hai.
// Kuch pages sirf logged-in ke liye (ProtectedRoute), kuch sirf logged-out ke liye (GuestRoute).

import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateRoom from "./pages/CreateRoom.jsx";
import JoinRoom from "./pages/JoinRoom.jsx";
import Workspace from "./pages/Workspace.jsx";

function App() {
  const { pathname } = useLocation();

  // Workspace poori screen leta hai (jaise /rooms/K7X9Q2AF), isliye wahan footer nahi dikhate.
  // /rooms/new aur /rooms/join workspace nahi hain.
  const isWorkspace = /^\/rooms\/(?!new$|join$)[^/]+$/.test(pathname);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Sabke liye */}
        <Route path="/" element={<Home />} />

        {/* Sirf logged-out users ke liye */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Sirf logged-in users ke liye */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms/new" element={<CreateRoom />} />
          <Route path="/rooms/join" element={<JoinRoom />} />
          <Route path="/rooms/:roomId" element={<Workspace />} />
        </Route>
      </Routes>
      {!isWorkspace && <Footer />}
    </>
  );
}

export default App;