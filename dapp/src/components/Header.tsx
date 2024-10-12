import { useStellarWallets } from "@/context/StellarWalletsContext";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateStr } from "@/utils";

export function Header() {
  const [stellarAddress, setStellarAddress] = useState("");
  const stellarWalletsKit = useStellarWallets();

  useEffect(() => {
    (async () => {
      const { address } = await stellarWalletsKit.getAddress();
      console.log(address);
      setStellarAddress(address);
    })();
  }, []);

  const handleConnect = async () => {
    try {
      if (stellarAddress != "") {
        stellarWalletsKit.disconnect();
        setStellarAddress("");
        return;
      }
      console.log(stellarWalletsKit);
      await stellarWalletsKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          stellarWalletsKit.setWallet(option.id);
          const { address } = await stellarWalletsKit.getAddress();
          console.log(address);
          setStellarAddress(address);
        },
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <header className="bg-gray-900 text-primary-foreground py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expense Splitter</h1>
        <Button variant="secondary" onClick={handleConnect}>
          <Wallet className="h-[1.2rem] w-[1.2rem] mr-2" />
          {stellarAddress == "" ? (
            <>Connect</>
          ) : (
            <>
              {/* Disconnect */}
              {truncateStr(stellarAddress, 4)}
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
