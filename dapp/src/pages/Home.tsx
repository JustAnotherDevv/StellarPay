import {
  //   StellarWalletsContext,
  useStellarWallets,
} from "@/context/StellarWalletsContext";
// import { useContext } from "react";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [stellarAddress, setStellarAddress] = useState(null);
  const stellarWalletsKit = useStellarWallets();

  useEffect(() => {
    (async () => {
      const { address } = await stellarWalletsKit.getAddress();
      console.log(address);
    })();
  }, []);

  const handleConnect = async () => {
    try {
      console.log(stellarWalletsKit);
      await stellarWalletsKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          stellarWalletsKit.setWallet(option.id);
          const { address } = await stellarWalletsKit.getAddress();
          console.log(address);
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

export default Home;
