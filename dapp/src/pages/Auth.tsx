import React, { useState, useEffect, useCallback } from 'react';
import { WebAuthn } from "@darkedges/capacitor-native-webauthn";
import { Buffer } from 'buffer';
import base64url from "base64url";
import { Capacitor } from "@capacitor/core";
import { Horizon, Keypair } from "@stellar/stellar-sdk";
import { Share } from "@capacitor/share";
import { motion, AnimatePresence } from "framer-motion";

// Import environment variables
const PUBLIC_horizonUrl = import.meta.env.VITE_PUBLIC_horizonUrl;

// Helper functions (these would need to be implemented or imported)
import { getPublicKeys } from "../lib/webauthn";
import { handleDeploy } from "../lib/deploy";
import { handleVoteBuild } from "../lib/vote_build";
import { handleVoteSend } from "../lib/vote_send";
import { getVotes } from "../lib/get_votes";

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const SoroPass: React.FC = () => {
  const [deployee, setDeployee] = useState<string | null>(null);
  const [bundlerKey, setBundlerKey] = useState<Keypair | null>(null);
  const [votes, setVotes] = useState({
    all_votes: {
      chicken: 0,
      egg: 0,
      chicken_percent: 0,
      egg_percent: 0,
      chicken_percent_no_source: 0,
      egg_percent_no_source: 0,
    },
    source_votes: {
      chicken: 0,
      egg: 0,
      chicken_percent: 0,
      egg_percent: 0,
    },
    total_source_votes: 0,
    total_all_votes: 0,
  });
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setStep(1), 500);

    const dotInterval = setInterval(() => {
      setDots(prev => prev.length === 3 ? "" : prev + ".");
    }, 500);

    const voteInterval = setInterval(() => onVotes(), 1500);

    if (localStorage.hasOwnProperty("sp:bundler")) {
      setBundlerKey(Keypair.fromSecret(localStorage.getItem("sp:bundler")!));
    } else {
      const newBundlerKey = Keypair.random();
      setBundlerKey(newBundlerKey);
      localStorage.setItem("sp:bundler", newBundlerKey.secret());

      const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl!);
      horizon.friendbot(newBundlerKey.publicKey()).call();
    }
    
    console.log("is local storage", localStorage);

    if (localStorage.hasOwnProperty("sp:deployee")) {
      setDeployee(localStorage.getItem("sp:deployee"));
      onVotes();
    }

    return () => {
      clearInterval(dotInterval);
      clearInterval(voteInterval);
    };
  }, []);

  const onRegister = useCallback(async (type?: "signin") => {
    if (!type && deployee) {
      setStep(prev => prev + 1);
      return;
    }
  
    try {
      setLoadingRegister(true);
  
      const isWebAuthnAvailable = await WebAuthn.isWebAuthnAvailable();
      if (!isWebAuthnAvailable.value) {
        throw new Error("WebAuthn is not available on this device");
      }
  
      let registerRes;
      if (type === "signin") {
        registerRes = await WebAuthn.startAuthentication({
          challenge: base64url("createchallenge"),
          rpId: Capacitor.isNativePlatform() ? "passkey.sorobanbyexample.org" : undefined,
          userVerification: "discouraged",
        });
      } else {
        registerRes = await WebAuthn.startRegistration({
          challenge: base64url(Buffer.from("createchallenge")),
          rp: {
            id: Capacitor.isNativePlatform() ? "passkey.sorobanbyexample.org" : undefined,
            name: "SoroPass",
          },
          user: {
            id: base64url("Soroban Test"),
            name: "Soroban Test",
            displayName: "Soroban Test",
          },
          authenticatorSelection: {
            requireResidentKey: false,
            residentKey: Capacitor.getPlatform() === "android" ? "preferred" : "discouraged",
            userVerification: "discouraged",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          attestation: "none",
        });
      }
  
      localStorage.setItem("sp:id", registerRes.id);
  
      const { contractSalt, publicKey } = await getPublicKeys(registerRes);
      const newDeployee = await handleDeploy(bundlerKey!, contractSalt, publicKey!);
      setDeployee(newDeployee);
      console.log("Logged in as", newDeployee);
      setStep(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert(JSON.stringify(error));
    } finally {
      setLoadingRegister(false);
    }
  }, [bundlerKey, deployee]);
  
  

  const onSign = useCallback(async () => {
    try {
      setLoadingSign(true);

      let { authTxn, authHash, lastLedger } = await handleVoteBuild(
        bundlerKey!,
        deployee!,
        choice === "chicken",
      );

      const signRes = await WebAuthn.startAuthentication({
        challenge: base64url(authHash),
        rpId: Capacitor.isNativePlatform()
          ? "passkey.sorobanbyexample.org"
          : undefined,
        allowCredentials: localStorage.hasOwnProperty("sp:id")
          ? [
              {
                id: localStorage.getItem("sp:id")!,
                type: "public-key",
              },
            ]
          : undefined,
        userVerification: "discouraged",
      });

      const respone = await handleVoteSend(bundlerKey!, authTxn, lastLedger, signRes);
      await onVotes();
      setStep(prev => prev + 1);
      console.log("Vote sent", respone, "Signature", signRes);
    } catch (error) {
      console.error(error);
      alert(JSON.stringify(error));
    } finally {
      setLoadingSign(false);
    }
  }, [bundlerKey, deployee, choice]);

  const onVotes = useCallback(async () => {
    if (bundlerKey && deployee) {
      const newVotes = await getVotes(bundlerKey, deployee);
      setVotes(newVotes);
      console.log("NewVote", newVotes);
    }
  }, [bundlerKey, deployee]);

  const truncateAccount = (account: string) => {
    return `${account.slice(0, 5)}...${account.slice(-5)}`;
  };

  const swipeHandler = (event: any) => {
    if (event.detail.direction === "right") goLeft();
    else if (event.detail.direction === "left") goRight();
  };

  const tapHandler = (event: any) => {
    if (
      !["div", "h1", "p"].includes(
        event.detail.target.tagName.toLowerCase()
      )
    )
      return;
    else if (
      document.querySelector("#soropass")?.clientWidth! / 2 >
      event.detail.x
    )
      goLeft();
    else goRight();
  };

  const goLeft = () => {
    if (!(step <= 1)) setStep(prev => prev - 1);
  };

  const goRight = () => {
    if (
      !(
        step >= 14 ||
        (step === 5 && !deployee) ||
        (step === 10 && !choice && !votes?.total_source_votes) ||
        (step === 11 && !votes?.total_source_votes)
      )
    )
      setStep(prev => prev + 1);
  };

  const shareContent = async () => {
    const { value } = await Share.canShare();

    if (value) {
      await Share.share({
        title: "Share SoroPass",
        text: "Check out this blockchain experience powered by your face or fingers!",
        url: "https://passkey.sorobanbyexample.org/",
        dialogTitle: `${choice === "chicken" ? 'Chicken 🐔' : 'Egg 🥚'} people unite!`,
      });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this blockchain experience powered by your face or fingers!")}&url=${encodeURIComponent("https://passkey.sorobanbyexample.org/")}`,
      );
    }
  };

  const resetAll = () => {
    localStorage.removeItem("sp:id");
    localStorage.removeItem("sp:bundler");
    localStorage.removeItem("sp:deployee");
    window.location.reload();
  };

  return (
    <div
      id="soropass"
      className={`relative w-full flex flex-col items-center justify-center h-dvh px-2 select-none overflow-hidden ${
        !Capacitor.isNativePlatform()
          ? 'max-h-[800px] max-w-[500px] py-2'
          : ''
      } ${loadingRegister || loadingSign ? 'pointer-events-none' : ''}`}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;
        
        const handleTouchEnd = (e: TouchEvent) => {
          const touch = e.changedTouches[0];
          const endX = touch.clientX;
          const endY = touch.clientY;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 100) {
              swipeHandler({ detail: { direction: "right" } });
            } else if (deltaX < -100) {
              swipeHandler({ detail: { direction: "left" } });
            }
          }
          
          document.removeEventListener('touchend', handleTouchEnd);
        };
        
        document.addEventListener('touchend', handleTouchEnd);
      }}
      onClick={(e) => tapHandler({ detail: { target: e.target, x: e.clientX } })}
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
            <p className="mb-4">Split is a fun and secure way to vote using blockchain technology.</p>
            <button
              onClick={() => setStep(2)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Get Started
            </button>
            

          </motion.div>
        )}


        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Register or Sign In</h1>
            <p className="mb-4">Use your device's biometrics to create or access your account.</p>
            <button
              onClick={() => onRegister()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              disabled={loadingRegister}
            >
              {loadingRegister ? 'Loading...' : 'Register'}
            </button>
            <button
              onClick={() => onRegister("signin")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loadingRegister}
            >
              {loadingRegister ? 'Loading...' : 'Sign In'}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
      <button onClick={onSign} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Sign
      </button>
      <button onClick={() => goLeft()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded">
      ⬅️
      </button>
      <button onClick={() => goRight()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded">➡️</button></div>
      
  );
};

export default SoroPass;