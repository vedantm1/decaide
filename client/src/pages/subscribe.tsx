import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from 'wouter';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { triggerAnimation } = useMicroInteractions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Welcome to the premium experience!",
      });
      
      // Show a success animation
      triggerAnimation('confetti', 'Subscription Activated!');
      
      // Redirect should happen automatically with return_url
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="bg-card border rounded-lg p-4">
        <PaymentElement />
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setLocation('/pricing')}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Back to plans
        </button>
        
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [priceId, setPriceId] = useState("");
  const [tier, setTier] = useState("");
  const [price, setPrice] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Get the subscription details from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const priceIdParam = params.get('priceId');
    const tierParam = params.get('tier');
    const priceParam = params.get('price');
    
    if (!priceIdParam || !tierParam || !priceParam) {
      toast({
        title: "Invalid subscription parameters",
        description: "Please select a plan first",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }
    
    setPriceId(priceIdParam);
    setTier(tierParam);
    setPrice(parseFloat(priceParam));
    
    // Check if user has an email
    if (!user?.email) {
      toast({
        title: "Email Required",
        description: "Please update your profile with an email address before subscribing.",
        variant: "destructive",
      });
      setLocation('/settings');
      return;
    }
    
    // Create or get subscription
    apiRequest("POST", "/api/get-or-create-subscription", { 
      priceId: priceIdParam
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setClientSecret(data.clientSecret);
      })
      .catch(error => {
        toast({
          title: "Subscription setup failed",
          description: error.message,
          variant: "destructive",
        });
        setLocation('/pricing');
      });
  }, [toast, setLocation, user]);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Subscribe to DecA(I)de</h1>
          <p className="text-muted-foreground mt-2">
            Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)} tier for ${price.toFixed(2)} per month
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscribeForm />
          </Elements>
        </div>
        
        <div className="mt-8 bg-muted p-4 rounded-md max-w-md mx-auto">
          <h3 className="font-medium text-center mb-2">{tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Benefits:</h3>
          {tier === 'plus' && (
            <ul className="space-y-1 text-sm">
              <li className="flex items-center"><span className="mr-2">✓</span> Additional roleplay scenarios with PI customization</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Twenty-five monthly test attempts</li>
              <li className="flex items-center"><span className="mr-2">✓</span> In-depth PI explanations with insights</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Advanced tracking with study recommendations</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Expanded gamification achievements</li>
            </ul>
          )}
          {tier === 'pro' && (
            <ul className="space-y-1 text-sm">
              <li className="flex items-center"><span className="mr-2">✓</span> Unlimited roleplay scenario generation</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Unlimited monthly test attempts</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Premium, customized PI explanations</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Advanced performance analytics and coaching</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Exclusive automated PDF report generation</li>
              <li className="flex items-center"><span className="mr-2">✓</span> Fully gamified and adaptive learning</li>
            </ul>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Your payment is processed securely by Stripe. We don't store your card details.</p>
          <p className="mt-2">15% of all profits are donated to DECA's Emerging Leader Scholarship Fund.</p>
          <p className="mt-2">You can cancel your subscription at any time from your account settings.</p>
          <p className="copyright-text">© {new Date().getFullYear()} DecA(I)de. All rights reserved.</p>
        </div>
      </div>>
    </div>
  );
};