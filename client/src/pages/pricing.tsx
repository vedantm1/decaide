import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <MainLayout>
      <PageHeader
        title="Subscription Plans"
        subtitle="Choose the plan that's right for you and take your DECA preparation to the next level."
        centered
      />

      {user?.subscriptionTier && (
        <div className="mb-8 text-center">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg inline-block">
            <p className="text-primary font-medium">
              Your current plan: <span className="font-bold capitalize">{user.subscriptionTier}</span>
            </p>
          </div>
        </div>
      )}

      {/* Pricing Content */}
      <div className="bg-background/60 backdrop-blur-sm rounded-xl border p-6 mb-8 shadow-sm">
        <div className="text-center">
          <p className="text-muted-foreground">
            Subscription plans and pricing content will be implemented here.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}