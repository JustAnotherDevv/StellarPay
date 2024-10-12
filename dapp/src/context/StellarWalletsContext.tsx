import React, { createContext, useContext, ReactNode } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export const StellarWalletsContext = createContext<
  StellarWalletsKit | undefined
>(undefined);

export const StellarWalletsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <StellarWalletsContext.Provider value={kit}>
      {children}
    </StellarWalletsContext.Provider>
  );
};

export const useStellarWallets = () => {
  const context = useContext(StellarWalletsContext);
  if (context === undefined) {
    throw new Error(
      "useStellarWallets must be used within a StellarWalletsProvider"
    );
  }
  return context;
};

// Example usage in a component:
const ExampleComponent: React.FC = () => {
  const stellarWalletsKit = useStellarWallets();

  const handleConnect = async () => {
    try {
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
        },
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
    </div>
  );
};

export default ExampleComponent;
