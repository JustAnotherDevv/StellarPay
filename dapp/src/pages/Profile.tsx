import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type Group = {
  id: number;
  name: string;
  totalAmount: number;
  paidAmount: number;
  isCreator: boolean;
};

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Profile() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Vacation",
      totalAmount: 1000,
      paidAmount: 600,
      isCreator: true,
    },
    {
      id: 2,
      name: "Dinner",
      totalAmount: 200,
      paidAmount: 50,
      isCreator: false,
    },
  ]);
  const { toast } = useToast();

  const handlePayment = (groupId: number) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          return { ...group, paidAmount: group.totalAmount };
        }
        return group;
      })
    );
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed.",
    });
  };

  const handleWithdraw = () =>
    // groupId: number
    {
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been submitted.",
      });
    };

  return (
    <motion.div
      className="space-y-8 py-4 px-4 mx-auto md:w-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl font-bold"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Your Expense Groups
      </motion.h2>
      <AnimatePresence>
        {groups.map((group) => (
          <MotionCard
            key={group.id}
            className="bg-primary text-gray-200 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="flex justify-between items-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <span>Total Amount: ${group.totalAmount}</span>
                <span>Paid Amount: ${group.paidAmount}</span>
              </motion.div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
                <motion.div
                  className="bg-blue-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(group.paidAmount / group.totalAmount) * 100}%`,
                  }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                ></motion.div>
              </div>
              {group.isCreator ? (
                <MotionButton
                  onClick={() =>
                    handleWithdraw()
                    // group.id
                  }
                  className="mt-4 w-full text-gray-700"
                  disabled={group.paidAmount < group.totalAmount}
                  variant="outline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Withdraw Funds
                </MotionButton>
              ) : (
                <MotionButton
                  onClick={() => handlePayment(group.id)}
                  className="mt-4 w-full text-gray-700"
                  disabled={group.paidAmount === group.totalAmount}
                  variant="outline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pay Your Share
                </MotionButton>
              )}
            </CardContent>
          </MotionCard>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
