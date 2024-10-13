import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

type Group = {
  id: number;
  name: string;
  totalAmount: number;
  paidAmount: number;
  isCreator: boolean;
};

interface Wallet {
  id: number;
  user: string;
  amount: number;
  completed: boolean;
}

interface ExpenseDetails {
  id: number;
  organizer: string;
  totalAmount: number;
  wallets: Wallet[];
}

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
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

  const expenseDetails: ExpenseDetails = {
    id: 1,
    organizer: "John Doe",
    totalAmount: 1000,
    wallets: [
      { id: 1, user: "Alice", amount: 250, completed: true },
      { id: 2, user: "Bob", amount: 250, completed: false },
      { id: 3, user: "Charlie", amount: 250, completed: true },
      { id: 4, user: "David", amount: 250, completed: false },
    ],
  };

  const totalPaid = expenseDetails.wallets.reduce(
    (sum, wallet) => (wallet.completed ? sum + wallet.amount : sum),
    0
  );

  const progressPercentage = (totalPaid / expenseDetails.totalAmount) * 100;

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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* <DialogTrigger asChild>
          <div className="cursor-pointer p-4 border rounded-lg hover:bg-gray-100">
            Click to view expense details
          </div>
        </DialogTrigger> */}

        <DialogContent className="sm:max-w-[425px] bg-primary text-gray-200">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Organized by {expenseDetails.organizer}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Wallets</h3>
            <ul className="space-y-2">
              {expenseDetails.wallets.map((wallet) => (
                <li
                  key={wallet.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {wallet.user}: ${wallet.amount}
                  </span>
                  {wallet.completed ? (
                    <Check className="text-green-500" />
                  ) : (
                    <X className="text-red-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Payment Progress</h3>
            <Progress
              value={progressPercentage}
              className="w-full bg-gray-200 text-blue-400"
            />
            <p className="text-sm text-gray-500 mt-1">
              ${totalPaid} paid of ${expenseDetails.totalAmount} total
            </p>
          </div>
          <Button onClick={() => setIsOpen(false)} className="mt-4">
            Close
          </Button>
        </DialogContent>

        <div
          className="relative h-40 bg-primary overflow-hidden rounded-md border border-gray-700"
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
              Your Expense Groups
            </motion.h1>
            <motion.p
              className="text-xl text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Where friends split bills and HODL together! 🚀💰
            </motion.p>
          </div>
        </div>
        {/* <motion.h2
        className="text-3xl font-bold"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Your Expense Groups
      </motion.h2> */}
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
                <DialogTrigger asChild>
                  <div>
                    {group.isCreator ? (
                      <MotionButton
                        onClick={
                          () => handleWithdraw()
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
                  </div>
                </DialogTrigger>
              </CardContent>
            </MotionCard>
          ))}
        </AnimatePresence>
      </Dialog>
    </motion.div>
  );
}
