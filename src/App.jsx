import { HashRouter, Routes, Route } from "react-router-dom";
import AISafety from "./pages/AISafetyCookBook";
import AISecurity from "./pages/AISecurityCookBook"
import Navbar from "./components/Navbar";

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AISafety />} />
        <Route path="/AISecurity" element={<AISecurity />} />
      </Routes>
    </HashRouter>
  );
}

export default App;