import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, DollarSign, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PaymentSplitterBanner = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Simulating user data fetch
    setTimeout(() => setUserName("Alex"), 1000);
  }, []);

  return (
    <div>
      <div className="px-4 py-4 mx-auto md:w-2/3 ">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 rounded-lg shadow-lg"
        >
          <Alert>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            >
              <AlertTitle className="text-2xl font-bold mb-2">
                Welcome to SplitPay, {userName}!
              </AlertTitle>
              <AlertDescription className="text-lg">
                Easily split expenses with friends and family.
              </AlertDescription>
            </motion.div>
          </Alert>

          <div className="mt-4 flex justify-around">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" className="flex items-center">
                <UserPlus className="mr-2" size={18} />
                Add Friends
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" className="flex items-center">
                <DollarSign className="mr-2" size={18} />
                New Expense
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" className="flex items-center">
                <Send className="mr-2" size={18} />
                Settle Up
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="px-4 py-4 mx-auto md:w-2/3 ">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 rounded-lg shadow-lg"
        >
          Your Groups - ToDo
          <br />
          Unpaid Debt - ToDo
          <br />
          Available Withdrawals - ToDo
          <br />
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSplitterBanner;
