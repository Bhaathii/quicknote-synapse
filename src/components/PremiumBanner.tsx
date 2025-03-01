
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PremiumBanner() {
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    toast({
      title: "Premium Upgrade",
      description: "This feature is coming soon! Premium subscription will be available in the next update.",
      variant: "default",
      duration: 5000,
    });
  };

  return (
    <div className="p-4 m-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 text-primary">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-1 mb-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="font-medium">Upgrade to Premium</h3>
        </div>
        <p className="text-sm mb-3 text-muted-foreground">
          Get voice notes, more storage and remove ads
        </p>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-none text-white w-full"
          onClick={handleUpgradeClick}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}
