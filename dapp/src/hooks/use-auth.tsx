import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { WebAuthn } from "@darkedges/capacitor-native-webauthn";
import { Capacitor } from "@capacitor/core";
import base64url from "base64url";
import { Keypair, Horizon } from "@stellar/stellar-sdk";
import { getPublicKeys } from "../lib/webauthn";
import { handleDeploy } from "../lib/deploy";

interface Connection {
  status: "connected" | "disconnected";
  network: "testnet" | "public" | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  deployee: string | null;
  bundlerKey: Keypair | null;
  connection: Connection;
  userAddress: string | null;
  register: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => void;
  initializeBundler: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Import environment variables
const PUBLIC_horizonUrl = import.meta.env.VITE_PUBLIC_horizonUrl;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [deployee, setDeployee] = useState<string | null>(null);
  const [bundlerKey, setBundlerKey] = useState<Keypair | null>(null);
  const [connection, setConnection] = useState<Connection>({
    status: "disconnected",
    network: null,
  });
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const initializeBundler = useCallback(async () => {
    if (localStorage.getItem("sp:bundler")) {
      const storedBundlerKey = Keypair.fromSecret(
        localStorage.getItem("sp:bundler")!
      );
      setBundlerKey(storedBundlerKey);
      setUserAddress(storedBundlerKey.publicKey());
    } else {
      const newBundlerKey = Keypair.random();
      setBundlerKey(newBundlerKey);
      setUserAddress(newBundlerKey.publicKey());
      localStorage.setItem("sp:bundler", newBundlerKey.secret());

      // Fund the new account using friendbot
      const horizon = new Horizon.Server(PUBLIC_horizonUrl!);
      try {
        await horizon.friendbot(newBundlerKey.publicKey()).call();
        console.log("New bundler account funded successfully");
      } catch (error) {
        console.error("Error funding new bundler account:", error);
      }
    }
  }, []);

  useEffect(() => {
    initializeBundler();

    // Check if user is already authenticated
    const storedDeployee = localStorage.getItem("sp:deployee");
    if (storedDeployee) {
      setDeployee(storedDeployee);
      setIsAuthenticated(true);
      setConnection({ status: "connected", network: "testnet" }); // Assuming testnet, adjust as needed
    }
  }, [initializeBundler]);

  const register = useCallback(async () => {
    try {
      const isWebAuthnAvailable = await WebAuthn.isWebAuthnAvailable();
      if (!isWebAuthnAvailable.value) {
        throw new Error("WebAuthn is not available on this device");
      }

      const registerRes = await WebAuthn.startRegistration({
        challenge: base64url(Buffer.from("createchallenge")),
        rp: {
          id: Capacitor.isNativePlatform()
            ? "passkey.sorobanbyexample.org"
            : undefined,
          name: "SoroPass",
        },
        user: {
          id: base64url("Soroban Test"),
          name: "Soroban Test",
          displayName: "Soroban Test",
        },
        authenticatorSelection: {
          requireResidentKey: false,
          residentKey:
            Capacitor.getPlatform() === "android" ? "preferred" : "discouraged",
          userVerification: "discouraged",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        attestation: "none",
      });

      localStorage.setItem("sp:id", registerRes.id);

      if (bundlerKey) {
        const { contractSalt, publicKey } = await getPublicKeys(registerRes);
        const newDeployee = await handleDeploy(
          bundlerKey,
          contractSalt,
          publicKey!
        );
        setDeployee(newDeployee);
        localStorage.setItem("sp:deployee", newDeployee);
        setIsAuthenticated(true);
        setConnection({ status: "connected", network: "testnet" }); // Assuming testnet, adjust as needed
      } else {
        throw new Error("BundlerKey is not initialized");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }, [bundlerKey]);

  const signIn = useCallback(async () => {
    try {
      const signInRes = await WebAuthn.startAuthentication({
        challenge: base64url("createchallenge"),
        rpId: Capacitor.isNativePlatform()
          ? "passkey.sorobanbyexample.org"
          : undefined,
        userVerification: "discouraged",
      });

      // Here you might want to verify the authentication on your server
      // For now, we'll just set the authenticated state
      localStorage.setItem("sp:id", signInRes.id);
      setIsAuthenticated(true);
      setConnection({ status: "connected", network: "testnet" }); // Assuming testnet, adjust as needed
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("sp:id");
    localStorage.removeItem("sp:deployee");
    setIsAuthenticated(false);
    setDeployee(null);
    setConnection({ status: "disconnected", network: null });
    setUserAddress(null);
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    deployee,
    bundlerKey,
    connection,
    userAddress,
    register,
    signIn,
    signOut,
    initializeBundler,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
