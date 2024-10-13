import { useState, useRef } from "react";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";

type Expense = {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
};

type Participant = {
  id: number;
  name: string;
};

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Create() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id">>({
    description: "",
    amount: 0,
    paidBy: "",
  });
  const [newParticipant, setNewParticipant] = useState("");
  const [splitType, setSplitType] = useState("manual");
  const [totalAmount, setTotalAmount] = useState(0);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addExpense = () => {
    if (newExpense.description && newExpense.amount > 0 && newExpense.paidBy) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
      setNewExpense({ description: "", amount: 0, paidBy: "" });
    } else {
      toast({
        title: "Invalid Expense",
        description: "Please fill in all expense details correctly.",
        variant: "destructive",
      });
    }
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const addParticipant = () => {
    if (newParticipant) {
      setParticipants([
        ...participants,
        { id: Date.now(), name: newParticipant },
      ]);
      setNewParticipant("");
    } else {
      toast({
        title: "Invalid Participant",
        description: "Please enter a participant name.",
        variant: "destructive",
      });
    }
  };

  const calculateSplitExpenses = () => {
    if (splitType === "even") {
      const perPersonExpense = totalAmount / participants.length;
      return participants.reduce((acc, participant) => {
        acc[participant.name] = -perPersonExpense;
        return acc;
      }, {} as Record<string, number>);
    } else {
      const totalExpense = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const perPersonExpense = totalExpense / participants.length;
      const balances: Record<string, number> = {};

      participants.forEach((participant) => {
        balances[participant.name] = 0;
      });

      expenses.forEach((expense) => {
        balances[expense.paidBy] += expense.amount;
      });

      Object.keys(balances).forEach((person) => {
        balances[person] -= perPersonExpense;
      });

      return balances;
    }
  };

  const splitExpenses = () => {
    if (
      participants.length < 2 ||
      (splitType === "manual" && expenses.length === 0) ||
      (splitType === "even" && totalAmount === 0)
    ) {
      toast({
        title: "Cannot Split Expenses",
        description:
          "Please add at least 2 participants and expenses or total amount.",
        variant: "destructive",
      });
      return;
    }

    const balances = calculateSplitExpenses();
    const messages: string[] = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0) {
        messages.push(`${person} is owed ${balance.toFixed(2)}`);
      } else if (balance < 0) {
        messages.push(`${person} owes ${Math.abs(balance).toFixed(2)}`);
      }
    });

    toast({
      title: "Expense Split Results",
      description: (
        <ul className="mt-2 space-y-1">
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      ),
      duration: 5000,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="space-y-8 px-4 py-4 mx-auto md:w-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MotionCard
        className="bg-primary text-gray-200 border border-gray-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Add Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Participant name"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
            <MotionButton
              variant="outline"
              className="mt-auto text-gray-800"
              onClick={addParticipant}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add
            </MotionButton>
          </div>
          <motion.div
            className="mt-4 flex flex-wrap gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <AnimatePresence>
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {participant.name}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </MotionCard>

      <MotionCard
        className="bg-primary text-gray-200 border border-gray-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <RadioGroup
            defaultValue="manual"
            onValueChange={(value) => setSplitType(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="manual"
                id="manual"
                className="
              peer
              h-4
              w-4
              shrink-0
              rounded-full
              border
              border-primary
              ring-offset-background
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-50
              data-[state=checked]:bg-primary-foreground
              data-[state=checked]:text-primary
              dark:border-gray-400
              dark:data-[state=checked]:bg-gray-300
              dark:data-[state=checked]:border-gray-300
              transition-colors
              text-gray-200 bg-white
            "
              />
              <Label htmlFor="manual">Manual Split</Label>
            </div>
            <div className="flex items-center space-x-2 text-gray-200">
              <RadioGroupItem
                className="peer
              h-4
              w-4
              shrink-0
              rounded-full
              border
              border-primary
              ring-offset-background
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-50
              data-[state=checked]:bg-primary-foreground
              data-[state=checked]:text-primary
              dark:border-gray-400
              dark:data-[state=checked]:bg-gray-300
              dark:data-[state=checked]:border-gray-300
              transition-colors
              text-gray-200 bg-white"
                value="even"
                id="even"
              />
              <Label htmlFor="even">Even Split</Label>
            </div>
          </RadioGroup>

          {splitType === "even" ? (
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="Total amount"
                value={totalAmount || ""}
                onChange={(e) =>
                  setTotalAmount(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Expense description"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount || ""}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By</Label>
                <Select
                  onValueChange={(value) =>
                    setNewExpense({ ...newExpense, paidBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.name}>
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {splitType === "manual" && (
            <MotionButton
              onClick={addExpense}
              className="w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </MotionButton>
          )}

          <div className="space-y-2">
            <Label htmlFor="receiptUpload">Upload Receipt</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="receiptUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <MotionButton
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Image
              </MotionButton>
              {receiptImage && (
                <span className="text-sm text-muted-foreground">
                  Image uploaded
                </span>
              )}
            </div>
          </div>

          {receiptImage && (
            <div className="mt-4">
              <img
                src={receiptImage}
                alt="Receipt"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </CardContent>
        {splitType === "manual" && (
          <CardFooter className="flex-col items-stretch">
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <AnimatePresence>
                {expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    className="flex justify-between items-center bg-primary border border-700 p-2 rounded-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>
                      {expense.description} - ${expense.amount.toFixed(2)} (Paid
                      by {expense.paidBy})
                    </span>
                    <MotionButton
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpense(expense.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </MotionButton>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </CardFooter>
        )}
      </MotionCard>

      <MotionButton
        onClick={splitExpenses}
        className="w-full bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Split Expenses
      </MotionButton>
    </motion.div>
  );
}
