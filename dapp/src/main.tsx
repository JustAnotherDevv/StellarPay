// import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StellarWalletsProvider } from "./context/StellarWalletsContext.tsx";

// import {
//   StellarWalletsKit,
//   WalletNetwork,
//   allowAllModules,
//   // XBULL_ID,
//   FREIGHTER_ID,
//   ISupportedWallet,
// } from "@creit.tech/stellar-wallets-kit";

// const kit: StellarWalletsKit = new StellarWalletsKit({
//   network: WalletNetwork.TESTNET,
//   selectedWalletId: FREIGHTER_ID,
//   modules: allowAllModules(),
// });

// globalThis.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarWalletsProvider>
      <App />
    </StellarWalletsProvider>
  </React.StrictMode>
);
