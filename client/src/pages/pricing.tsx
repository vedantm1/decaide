import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";

// Add Stripe Pricing Table declaration for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
      }, HTMLElement>;
    }
  }
}

export default function PricingPage() {
  const { user } = useAuth();
  
  // Subscription update mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", "/api/user/subscription", { tier });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update subscription:", error);
    }
  });
  
  // Load Stripe script on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          {/* Pricing Header */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-heading font-bold text-slate-800 mb-3">Subscription Plans</h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Choose the plan that's right for you and take your DECA preparation to the next level.
            </p>
            
            {user?.subscriptionTier && (
              <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-lg inline-block">
                <p className="text-primary-700 font-medium">
                  Your current plan: <span className="font-bold capitalize">{user.subscriptionTier}</span>
                </p>
              </div>
            )}
          </header>
          
          {/* Pricing Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Standard Plan */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 bg-slate-50">
                  <h3 className="font-heading font-bold text-xl text-slate-800">Standard <span className="text-primary">⭐️⭐️</span></h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-bold text-slate-800">$12.99</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-slate-500 text-sm">Essential DECA preparation for beginners</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>3 AI-generated roleplay scenarios per month</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>2 monthly test attempts for exam practice</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Fundamental PI explanations with real-world examples</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Standard progress tracking with leaderboard display</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Gamified experience with points and achievement badges</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    {user?.subscriptionTier === "standard" ? (
                      <button disabled className="w-full py-2 px-4 bg-slate-200 text-slate-600 rounded-lg text-center font-medium">
                        Current Plan
                      </button>
                    ) : (
                      <Link 
                        to={`/subscribe?priceId=price_standard&tier=standard&price=12.99`}
                        className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-center font-medium transition block"
                      >
                        Select Plan
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Plus Plan */}
              <div className="border-2 border-primary rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                  MOST POPULAR
                </div>
                <div className="p-6 bg-primary-50">
                  <h3 className="font-heading font-bold text-xl text-slate-800">Plus <span className="text-primary">⭐️⭐️⭐️</span></h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-bold text-slate-800">$19.99</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-slate-500 text-sm">Enhanced features for competitive advantage</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>10 roleplay scenarios per month with PI customization</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>8 monthly test attempts</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>In-depth PI explanations with real-world insights</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Advanced progress tracking and personalized study recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Gamified experience with expanded achievements</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    {user?.subscriptionTier === "plus" ? (
                      <button disabled className="w-full py-2 px-4 bg-slate-200 text-slate-600 rounded-lg text-center font-medium">
                        Current Plan
                      </button>
                    ) : (
                      <Link 
                        to={`/subscribe?priceId=price_plus&tier=plus&price=19.99`}
                        className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-center font-medium transition block"
                      >
                        Upgrade to Plus
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 bg-slate-50">
                  <h3 className="font-heading font-bold text-xl text-slate-800">Pro <span className="text-primary">⭐️⭐️⭐️⭐️⭐️</span></h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-bold text-slate-800">$39.99</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-slate-500 text-sm">Ultimate preparation for DECA champions</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Unlimited roleplay scenario generation</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Unlimited monthly test attempts</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Premium, customized PI explanations</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Advanced performance analytics and interactive coaching</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Exclusive automated PDF report generation</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-2"></i>
                      <span>Fully gamified and adaptive learning experience</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    {user?.subscriptionTier === "pro" ? (
                      <button disabled className="w-full py-2 px-4 bg-slate-200 text-slate-600 rounded-lg text-center font-medium">
                        Current Plan
                      </button>
                    ) : (
                      <Link 
                        to={`/subscribe?priceId=price_pro&tier=pro&price=39.99`}
                        className="w-full py-2 px-4 bg-accent hover:bg-accent/90 text-white rounded-lg text-center font-medium transition block"
                      >
                        Upgrade to Pro
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stripe Pricing Table - Enable when ready */}
          {false && (
            <div className="mb-8">
              <stripe-pricing-table
                pricing-table-id="prctbl_1R5Jhc2fAXktF0IPTDZ03BYv"
                publishable-key={import.meta.env.VITE_STRIPE_PUBLIC_KEY || ""}
              ></stripe-pricing-table>
            </div>
          )}
          
          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-heading font-bold text-lg text-slate-800 mb-3">Can I change my plan later?</h3>
                <p className="text-slate-600">Yes! You can upgrade or downgrade your plan at any time. Changes will be effective immediately.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-heading font-bold text-lg text-slate-800 mb-3">Is there a refund policy?</h3>
                <p className="text-slate-600">We offer a 7-day money-back guarantee if you're not satisfied with your subscription.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-heading font-bold text-lg text-slate-800 mb-3">How do the practice limits work?</h3>
                <p className="text-slate-600">Limits reset on the 1st of each month. Unused practice sessions do not roll over to the next month.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-heading font-bold text-lg text-slate-800 mb-3">Do you offer team discounts?</h3>
                <p className="text-slate-600">Yes! Contact us for special pricing for DECA chapters or school teams of 10 or more students.</p>
              </div>
            </div>
          </div>
          
          {/* Contact */}
          <div className="text-center mb-12">
            <p className="text-slate-600">Have more questions? <a href="mailto:support@decade-deca.ai" className="text-primary font-medium">Contact our support team</a></p>
          </div>
          
          {/* Footer */}
          <footer className="border-t border-slate-200 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-base">D</span>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    AI
                  </span>
                </div>
                <span className="font-heading font-bold text-base text-slate-800">DecA<span className="text-primary">(I)</span>de</span>
              </div>
              
              <div className="text-center md:text-right">
                <div className="text-sm text-slate-500">© 2023 DecA(I)de. All rights reserved.</div>
                <div className="text-xs text-slate-400 mt-1">Who says there is no I in team?</div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}