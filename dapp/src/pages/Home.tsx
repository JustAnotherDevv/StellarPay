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

export default function Home() {
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

  return <div className="space-y-8 px-4 py-4 mx-auto md:w-1/2">HOME</div>;
}
