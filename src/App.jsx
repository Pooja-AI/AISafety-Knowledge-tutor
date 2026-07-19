import { HashRouter, Routes, Route } from "react-router-dom";
import AISafety from "./pages/AISafetyCookBook";
import AISecurity from "./pages/AISecurityCookBook"
import ExplainableAI from "./pages/AIExplainableCookBook"
import Navbar from "./components/Navbar";

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AISafety />} />
        <Route path="/AISecurity" element={<AISecurity />} />
        <Route path="/ExplainableAI" element={<ExplainableAI />} />

      </Routes>
    </HashRouter>
  );
}

export default App;