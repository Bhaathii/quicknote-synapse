
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planType: string) => {
    navigate("/payment", { state: { plan: planType } });
  };

  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center md:justify-start mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to notes
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
        <p className="text-muted-foreground mt-2">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <div className="border rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Free</h3>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
              Current
            </span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Basic note taking</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>100MB storage</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Access on all devices</span>
            </li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Continue with Free
          </Button>
        </div>

        {/* Monthly Plan */}
        <div className="border rounded-lg shadow-sm p-6 border-amber-400 dark:border-amber-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Monthly</h3>
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
              Popular
            </span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">$4.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Everything in Free</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Voice notes</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>5GB storage</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Ad-free experience</span>
            </li>
          </ul>
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600"
            onClick={() => handleSelectPlan("monthly")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </div>

        {/* Annual Plan */}
        <div className="border rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Annual</h3>
            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm">
              Save 20%
            </span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">$47.99</span>
            <span className="text-muted-foreground">/year</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Everything in Monthly</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>10GB storage</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Early access to new features</span>
            </li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            onClick={() => handleSelectPlan("annual")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Select Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
