import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Create from "./pages/Create";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <Router>
        <div>
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
