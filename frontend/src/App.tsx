import { Routes, Route, Navigate } from "react-router-dom";
import ResultsPage from "./pages/Results";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} GapFit AI — Built for the Codomax AI & ML Internship
      </footer>
    </div>
  );
}

export default App;