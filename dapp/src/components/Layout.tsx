import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Home, Plus, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useStellarWallets } from "@/context/StellarWalletsContext";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { truncateStr } from "@/utils";
import { Link } from "react-router-dom";

const Logo = () => (
  <div className="flex items-center justify-center mb-6">
    <img
      className="w-12 h-12 overflow-hidden rounded-full"
      src="/logo.png"
      alt=""
    />
    <h1 className="text-3xl font-bold ml-2">SplitPay</h1>
  </div>
);

const NavItem = ({ icon: Icon, label, path, isActive, isMobile, onClick }) => {
  return (
    <Link
      to={path}
      // className={`flex border border-black/0 hover:border-gray-400 rounded-md p-2 hover:bg-gray-800/90 ${
      //   location.pathname == "/" ? "bg-gray-800/90" : ""
      // }`}
    >
      <motion.div
        whileTap={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`flex items-center justify-start relative w-full ${
            isActive
              ? "bg-blue-600 text-white hover:bg-white hover:text-black"
              : "text-gray-400"
          } relative`}
          onClick={onClick}
        >
          <motion.div
            initial={{ scale: 1 }}
            whileTap={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
          {!isMobile ? (
            <motion.span
              className="text-xs ml-2"
              initial={{ scale: 1 }}
              whileTap={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          ) : null}
          {isActive && (
            <motion.div
              className="absolute -top-1 -right-1 bg-blue-400 rounded-full p-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
      </motion.div>
    </Link>
  );
};

const Navigation = ({ isMobile, activePage, setActivePage }) => {
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

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Plus, label: "Create", path: "/create" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const navClass = isMobile
    ? "fixed bottom-0 left-0 right-0 bg-primary p-2 z-10"
    : "sticky top-0 h-screen w-52 bg-primary p-4 flex flex-col justify-between overflow-y-auto";

  if (isMobile) {
    return (
      <nav className={navClass}>
        <div className={isMobile ? "flex justify-around" : "space-y-2"}>
          {navItems.map(({ icon, label, path }) => (
            <NavItem
              key={label}
              icon={icon}
              label={label}
              path={path}
              isActive={activePage === label}
              isMobile={isMobile}
              onClick={() => setActivePage(label)}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={navClass}>
      <div>
        <Logo />
        <div
          className={
            isMobile ? "flex justify-around" : "space-y-2 flex flex-col"
          }
        >
          {navItems.map(({ icon, label, path }) => (
            <NavItem
              key={label}
              icon={icon}
              label={label}
              path={path}
              isActive={activePage === label}
              isMobile={isMobile}
              onClick={() => setActivePage(label)}
            />
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        className="mt-auto w-full text-gray-800"
        onClick={handleConnect}
      >
        <Wallet className="mr-2 h-4 w-4" />{" "}
        {stellarAddress == "" ? (
          <>Connect Wallet</>
        ) : (
          <>
            {/* Disconnect */}
            {truncateStr(stellarAddress, 5)}
          </>
        )}
      </Button>
    </nav>
  );
};

export default function Layout({ children }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [activePage, setActivePage] = useState("Home");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-800 text-white">
      {!isMobile && (
        <Navigation
          isMobile={false}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      )}
      <main className={`flex-1 p-4 ${isMobile ? "pb-20" : ""} overflow-y-auto`}>
        {children}
      </main>
      {isMobile && (
        <Navigation
          isMobile={true}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      )}
    </div>
  );
}
