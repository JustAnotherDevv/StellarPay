import { useStellarWallets } from "@/context/StellarWalletsContext";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { useEffect, useState } from "react";
import { Wallet, Plus, PersonStanding, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateStr } from "@/utils";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Header() {
  const [stellarAddress, setStellarAddress] = useState("");
  const stellarWalletsKit = useStellarWallets();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const { address } = await stellarWalletsKit.getAddress();
      console.log(address);
      console.log(location.pathname);
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
        <div className="flex justify-around gap-2 items-center">
          <img
            className="w-14 h-14 overflow-hidden rounded-full"
            src="/logo.png"
            alt=""
          />
          <h1 className="text-3xl font-bold">Stellar Pay</h1>
        </div>
        <nav>
          <ul className="invisible md:visible flex gap-2">
            <li className="">
              <Link
                to="/"
                className={`flex border border-black/0 hover:border-gray-400 rounded-md p-2 hover:bg-gray-800/90 ${
                  location.pathname == "/" ? "bg-gray-800/90" : ""
                }`}
              >
                <Home className=" mr-2" />
                Home
              </Link>
            </li>
            <li className="">
              <Link
                to="/create"
                className={`flex border border-black/0 hover:border-gray-400 rounded-md p-2 hover:bg-gray-800/90 ${
                  location.pathname == "/create" ? "bg-gray-800/90" : ""
                }`}
              >
                <Plus className=" mr-2" />
                Create
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`flex border border-black/0  hover:border-gray-400 rounded-md p-2 hover:bg-gray-800/90 ${
                  location.pathname == "/profile" ? "bg-gray-800/90" : ""
                }`}
              >
                <PersonStanding className=" mr-2" />
                Profile
              </Link>
            </li>
          </ul>
        </nav>
        <Button className="w-36" variant="secondary" onClick={handleConnect}>
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
