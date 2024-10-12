import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StellarWalletsProvider } from "./context/StellarWalletsContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarWalletsProvider>
      <App />
    </StellarWalletsProvider>
  </React.StrictMode>
);
