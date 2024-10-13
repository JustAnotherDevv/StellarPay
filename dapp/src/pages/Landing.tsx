import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight, Coins, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
const Landing = () => {
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering with username:", username);
    register();
  };

  const handleWalletLogin = () => {
    console.log("Logging in with wallet");
    signIn();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div
      className="min-h-screen relative
    // bg-gradient-to-b from-gray-900 to-black 
    
    text-gray-100 p-6"
    >
      {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"></dxiv> */}

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: 'url("/memphis-mini-dark.webp")',
          filter: "blur(5px)",
        }}
      ></div>

      <motion.div
        className="max-w-md md:max-w-3/4 w-full mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="relative mb-16" variants={itemVariants}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-gray-200 drop-shadow-lg">
                CryptoSplit
              </h1>
              <p className="text-xl text-gray-200 mb-6 drop-shadow">
                Split expenses with crypto, revolutionize your finances
              </p>
              {/* <div className="flex space-x-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-md"
                  onClick={register}
                >
                  Register
                </Button>
                <Button
                  variant="outline"
                  className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 rounded-md"
                  onClick={signIn}
                >
                  Login
                </Button>
              </div> */}
              <Card className="w-full bg-transparent text-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {isRegistering ? "Register" : "Login"}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose your authentication method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isRegistering ? (
                      <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        />
                        <Button
                          type="submit"
                          className="w-full bg-white hover:bg-gray-200 text-gray-700"
                        >
                          Register
                        </Button>
                      </form>
                    ) : (
                      <Button
                        onClick={handleWalletLogin}
                        className="w-full bg-white hover:bg-gray-200 text-gray-700"
                      >
                        Login with Passkey
                      </Button>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Button
                      variant="link"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="mt-4 w-full text-blue-400 hover:text-blue-300"
                    >
                      {isRegistering ? "Switch to Login" : "Switch to Register"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.header>

        <motion.section variants={itemVariants}>
          <Card className="bg-primary-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-200">
                About CryptoSplit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                CryptoSplit is the ultimate solution for splitting expenses
                using cryptocurrencies. Whether you're traveling with friends,
                sharing a house, or managing group purchases, CryptoSplit makes
                it easy to keep track of expenses and settle debts using your
                favorite cryptocurrencies.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section className="space-y-6" variants={containerVariants}>
          <motion.h2
            className="text-2xl font-semibold text-gray-200 text-center"
            variants={itemVariants}
          >
            Features
          </motion.h2>
          {[
            {
              icon: Coins,
              title: "Multi-Crypto Support",
              description: "Split expenses using various cryptocurrencies",
            },
            {
              icon: Users,
              title: "Group Management",
              description: "Create and manage expense groups easily",
            },
            {
              icon: Zap,
              title: "Passkey Support",
              description: "Settle debts quickly with Passkey-powered wallets",
            },
          ].map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-primary-800 border-gray-700 hover:bg-gray-750 transition-colors duration-200">
                <CardContent className="flex items-center p-4">
                  <feature.icon className="w-8 h-8 mr-4 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  {/* <ChevronRight className="ml-auto text-purple-400" /> */}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <motion.footer
          className="text-center text-sm text-gray-500"
          variants={itemVariants}
        >
          Built for EasyA Stellar London hackathon
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Landing;
