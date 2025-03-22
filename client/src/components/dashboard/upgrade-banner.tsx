import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_LIMITS } from "@shared/schema";
import { motion } from "framer-motion";

interface UpgradeBannerProps {
  currentTier: string;
}

export default function UpgradeBanner({ currentTier }: UpgradeBannerProps) {
  const tiers = Object.keys(SUBSCRIPTION_LIMITS);
  
  // Calculate stars for each tier
  const getTierStars = (tier: string) => {
    return SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS]?.stars || 0;
  };
  
  // Format features based on tier
  const getFeatureText = (tier: string) => {
    const limits = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS];
    const roleplays = limits.roleplays === -1 ? "Unlimited" : `${limits.roleplays} Roleplays/mo`;
    return roleplays;
  };

  return (
    <motion.section 
      className="mt-8 relative bg-white rounded-xl border border-slate-200 p-6 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="md:w-3/5">
          <span className="bg-accent-100 text-accent-700 text-xs font-medium px-2.5 py-1 rounded-full">
            UPGRADE YOUR PLAN
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-800 font-heading">Unlock unlimited roleplay scenarios <br className="hidden md:block"/> and practice tests!</h2>
          <p className="mt-2 text-slate-600 text-sm">Get unlimited access to all features and prepare like a champion for the DECA competition.</p>
          <div className="mt-4 flex items-center gap-3">
            <Button className="bg-accent hover:bg-accent/90 text-white">
              Upgrade to Pro
            </Button>
            <Button variant="link" className="text-primary">
              View all plans
            </Button>
          </div>
        </div>
        
        {/* Plan Comparison */}
        <div className="mt-6 md:mt-0 md:w-2/5">
          <div className="grid grid-cols-3 gap-2">
            {tiers.map(tier => (
              <div 
                key={tier}
                className={`rounded-lg p-3 text-center ${
                  tier === currentTier 
                    ? 'border-2 border-primary-400 bg-slate-50' 
                    : tier === 'pro' 
                    ? 'bg-accent-50' 
                    : 'bg-slate-50'
                }`}
              >
                <div className="flex justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < getTierStars(tier) ? "text-accent" : "text-slate-300"}>★</span>
                  ))}
                </div>
                <h4 className="font-medium text-sm mt-2 text-slate-700 capitalize">{tier}</h4>
                <p className={`text-xs ${tier === 'pro' ? 'text-accent-700 font-medium' : 'text-slate-500'} mt-1`}>
                  {tier === 'pro' ? 'Unlimited!' : getFeatureText(tier)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-accent-100 rounded-full opacity-50"></div>
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-accent-200 rounded-full opacity-50"></div>
    </motion.section>
  );
}
