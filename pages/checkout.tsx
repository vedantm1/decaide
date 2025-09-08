import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
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
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      
      // Show a success animation
      triggerAnimation('confetti', 'Payment Complete!');
      
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
          onClick={() => setLocation('/dashboard')}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Cancel
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
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get the product details from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    const amountParam = params.get('amount');
    
    if (!productParam || !amountParam) {
      toast({
        title: "Invalid checkout parameters",
        description: "Please select a product first",
        variant: "destructive",
      });
      setLocation('/dashboard');
      return;
    }
    
    setProductName(productParam);
    setAmount(parseFloat(amountParam));
    
    // Create a payment intent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: parseFloat(amountParam)
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
          title: "Payment setup failed",
          description: error.message,
          variant: "destructive",
        });
        setLocation('/dashboard');
      });
  }, [toast, setLocation]);

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
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Purchase</h1>
          <p className="text-muted-foreground mt-2">
            {productName} - ${amount.toFixed(2)}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Your payment is processed securely by Stripe. We don't store your card details.</p>
          <p className="mt-2">15% of all profits are donated to DECA's Emerging Leader Scholarship Fund.</p>
        </div>
      </div>
    </div>
  );
};