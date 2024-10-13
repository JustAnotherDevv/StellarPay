import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  PieChart,
  Users,
  CreditCard,
  Plus,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStellarWallets } from "@/context/StellarWalletsContext";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { contractRead, truncateStr } from "@/utils";
// import { useMediaQuery } from "react-responsive";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
const MotionCard = motion(Card);
// const MotionButton = motion(Button);

const PaymentSplitterBanner = () => {
  //   const isMobile = useMediaQuery({ maxWidth: 768 });
  const [userName, setUserName] = useState("");
  const [stellarAddress, setStellarAddress] = useState("");
  const stellarWalletsKit = useStellarWallets();
  const {
    isAuthenticated,
    connection,
    userAddress,
    bundlerKey,
    register,
    signIn,
    signOut,
    initializeBundler,
  } = useAuth();

  const menuItems = [
    { icon: Plus, label: "New Split" },
    { icon: ArrowRightLeft, label: "Settle Up" },
    { icon: UserPlus, label: "Add Friends" },
  ];

  const expenses = [
    {
      id: 1,
      title: "Dinner",
      amount: 75.5,
      date: "2024-10-15",
      type: "upcoming",
    },
    {
      id: 2,
      title: "Movie night",
      amount: 30.0,
      date: "2024-10-10",
      type: "upcoming",
    },
    {
      id: 3,
      title: "Groceries",
      amount: 45.75,
      date: "2024-10-08",
      type: "past",
    },
    {
      id: 4,
      title: "Utilities",
      amount: 100.0,
      date: "2024-10-05",
      type: "past",
    },
  ];

  const fetchGroupById = async (id = 0) => {
    const formattedAddress = nativeToScVal("0", { type: "symbol" });

    const name = await contractRead(bundlerKey, "get_group", [
      formattedAddress,
    ]);
    const decodedName = scValToNative(name.result?.retval!);
    console.log("name ", name, " ", decodedName);
  };

  useEffect(() => {
    initializeBundler();
  }, []);

  useEffect(() => {
    (async () => {
      if (!bundlerKey) return;
      const formattedAddress = nativeToScVal(
        "GAIKTILDUD5TXL2FY5F4RAPDTTLUVKIOW3YA3WXKQM5RBEFLSUPZIMCE",
        { type: "address" }
      );

      const name = await contractRead(bundlerKey, "get_member", [
        formattedAddress,
      ]);
      const decodedName = scValToNative(name.result?.retval!);
      console.log("name ", name, " ", decodedName);
      setUserName(decodedName.nickname);

      await fetchGroupById();
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    (async () => {
      const { address } = await stellarWalletsKit.getAddress();
      console.log(address);
      setStellarAddress(address);
      console.log(userName);
    })();
  }, []);

  //   useEffect(() => {
  //     setTimeout(() => setUserName("Alex"), 1000);
  //   }, []);

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
    <div>
      <div className="min-h-screen text-gray-100 md:w-3/4 mx-auto">
        <div
          className="relative h-60 bg-primary overflow-hidden rounded-md border border-gray-700"
          style={{
            position: "relative",
            isolation: "isolate",
          }}
        >
          <div
            style={{
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: 'url("/bg-2.jpg")',
              // backgroundSize: "100px",
              // backgroundRepeat: "repeat",
              opacity: 0.3,
              zIndex: -1,
            }}
          />
          <motion.div
            className="absolute inset-0 bg-gray-800"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
              opacity: [0.2, 0.3],
            }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
            <motion.h1
              className="text-4xl font-bold mb-2 text-gray-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome to SplitPay */}
              GM {userName}
            </motion.h1>
            <motion.p
              className="text-xl text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Split expenses with friends, powered by crypto
            </motion.p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto pt-4 sm:pt-8  w-full">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MotionCard
              className="bg-primary text-gray-200 border border-gray-700 overflow-hidden relative shine-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-semibold">@{userName}</h2>
                      <p className="text-gray-400">
                        {truncateStr(userAddress, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 items-center sm:items-end">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-lg font-medium">5 Groups</span>
                    </div>
                    {/* <Button
                      variant="outline"
                      className="w-full sm:w-auto text-gray-800"
                      onClick={handleConnect}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {stellarAddress === ""
                        ? "Connect Wallet"
                        : truncateStr(stellarAddress, 5)}
                    </Button> */}
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-gray-800"
                      onClick={() => {
                        console.log("sds");
                        if (!userAddress) {
                          signIn();
                        } else {
                          console.log("signing out");
                          signOut();
                        }
                      }}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {!isAuthenticated && !userAddress
                        ? "Connect Wallet"
                        : truncateStr(userAddress, 5)}
                    </Button>
                    {isAuthenticated.toString()}
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </motion.div>
          <style>{`
            .shine-effect {
              position: relative;
              overflow: hidden;
            }
            .shine-effect::before {
              content: "";
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(
                to bottom right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.1) 50%,
                rgba(255, 255, 255, 0) 100%
              );
              transform: rotate(45deg);
              animation: shine 3s infinite;
            }
            @keyframes shine {
              0% {
                transform: translateX(-200%) translateY(-200%) rotate(45deg);
              }
              100% {
                transform: translateX(200%) translateY(200%) rotate(45deg);
              }
            }
          `}</style>
        </div>

        <div className="max-w-4xl mx-auto py-8">
          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="default"
                className="h-20 flex flex-col items-center justify-center "
              >
                <item.icon className="h-6 w-6 mb-2" />
                <span>{item.label}</span>
              </Button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Upcoming Expenses</h2>
              <Card className="bg-primary border-gray-700">
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-700">
                    {expenses
                      .filter((e) => e.type === "upcoming")
                      .map((expense) => (
                        <li
                          key={expense.id}
                          className="flex justify-between items-center p-4"
                        >
                          <div>
                            <p className="font-medium text-gray-200">
                              {expense.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {expense.date}
                            </p>
                          </div>
                          <span className="font-bold text-green-400">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Past Expenses</h2>
              <Card className="bg-primary border-gray-700">
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-700">
                    {expenses
                      .filter((e) => e.type === "past")
                      .map((expense) => (
                        <li
                          key={expense.id}
                          className="flex justify-between items-center p-4"
                        >
                          <div>
                            <p className="font-medium text-gray-200">
                              {expense.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {expense.date}
                            </p>
                          </div>
                          <span className="font-bold text-blue-400">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        <div className="flex flex-col mx-auto mb-8">
          <div className="flex mb-4">
            <h1 className="text-2xl font-bold mb-4 mx-auto display-block block">
              All the features in one app
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-200"
          >
            <Card className="bg-primary border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-200">
                  <PieChart className="mr-2 " /> Easy Splitting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Split expenses evenly or customize amounts for each person.
              </CardContent>
            </Card>
            <Card className="bg-primary border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-200">
                  <Users className="mr-2" /> Group Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Create and manage multiple expense groups for different
                occasions.
              </CardContent>
            </Card>
            <Card className="bg-primary border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-200">
                  <CreditCard className="mr-2" /> Crypto Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Settle debts using various tokens securely and quickly.
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSplitterBanner;
