import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Group = {
  id: number;
  name: string;
  totalAmount: number;
  paidAmount: number;
  isCreator: boolean;
};

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

  const handleWithdraw = (groupId: number) => {
    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request has been submitted.",
    });
  };

  return (
    <div className="space-y-8 py-4 px-4 mx-auto md:w-1/2">
      <h2 className="text-3xl font-bold">Your Expense Groups</h2>
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span>Total Amount: ${group.totalAmount}</span>
              <span>Paid Amount: ${group.paidAmount}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-secondary">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{
                  width: `${(group.paidAmount / group.totalAmount) * 100}%`,
                }}
              ></div>
            </div>
            {group.isCreator ? (
              <Button
                onClick={() => handleWithdraw(group.id)}
                className="mt-4 w-full"
                disabled={group.paidAmount < group.totalAmount}
              >
                Withdraw Funds
              </Button>
            ) : (
              <Button
                onClick={() => handlePayment(group.id)}
                className="mt-4 w-full"
                disabled={group.paidAmount === group.totalAmount}
              >
                Pay Your Share
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
