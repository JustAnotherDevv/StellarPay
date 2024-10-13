import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Create from "./pages/Create";
import SoroPass from "./pages/Auth";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { isAuthenticated, userAddress } = useAuth();
  if (!isAuthenticated && !userAddress) return <Landing />;

  return (
    <>
      <Router>
        <div>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pass" element={<SoroPass />} />
              {/* <Route path="/landing" element={<Landing />} /> */}
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
