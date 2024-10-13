import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Create from "./pages/Create";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout";

function App() {
  return (
    <>
      <Router>
        <div>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
