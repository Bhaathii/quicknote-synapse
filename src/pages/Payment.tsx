
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Calendar, Lock, ArrowLeft } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Get plan from location state or default to monthly
  const plan = location.state?.plan || "monthly";
  
  // Plan details
  const planDetails = {
    monthly: {
      name: "Monthly Premium",
      price: "$4.99",
      period: "month",
    },
    annual: {
      name: "Annual Premium",
      price: "$47.99",
      period: "year",
    }
  };

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setPaymentInfo({ ...paymentInfo, [name]: formatted });
      return;
    }
    
    // Format expiry date
    if (name === "expiry") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .substring(0, 5);
      setPaymentInfo({ ...paymentInfo, [name]: formatted });
      return;
    }
    
    setPaymentInfo({ ...paymentInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      
      // Show success message
      toast({
        title: "Payment Successful!",
        description: `You are now subscribed to the ${planDetails[plan as keyof typeof planDetails].name} plan.`,
        duration: 5000,
      });
      
      // Navigate back to home page
      navigate("/", { state: { isPremium: true } });
    }, 2000);
  };

  return (
    <div className="container max-w-md px-4 py-8 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/subscription")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plans
      </Button>
      
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
        <p className="text-muted-foreground mt-2">
          {planDetails[plan as keyof typeof planDetails].name} - {planDetails[plan as keyof typeof planDetails].price}/{planDetails[plan as keyof typeof planDetails].period}
        </p>
      </div>
      
      <div className="border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cardName" className="block text-sm font-medium">
                Name on Card
              </label>
              <Input
                id="cardName"
                name="cardName"
                value={paymentInfo.cardName}
                onChange={handleInputChange}
                placeholder="John Smith"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium">
                Card Number
              </label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiry" className="block text-sm font-medium">
                  Expiry Date
                </label>
                <div className="relative">
                  <Input
                    id="expiry"
                    name="expiry"
                    value={paymentInfo.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cvc" className="block text-sm font-medium">
                  CVC
                </label>
                <div className="relative">
                  <Input
                    id="cvc"
                    name="cvc"
                    value={paymentInfo.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Processing..." : `Pay ${planDetails[plan as keyof typeof planDetails].price}`}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <Lock className="inline mr-1 h-4 w-4" />
        Your payment information is secure
      </div>
    </div>
  );
};

export default Payment;
