import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
  
  // Load Stripe.js
  useEffect(() => {
    // Create script element for Stripe
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    
    // Add script to document
    document.body.appendChild(script);
    
    // Cleanup
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
          <header className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-slate-800">Subscription Plans</h1>
            <p className="text-slate-500 mt-1">Choose the perfect plan for your DECA competition preparation</p>
          </header>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Plan: {user?.subscriptionTier || "Standard"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-center mb-6">Choose Your DecA(I)de Plan</h2>
                <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                  Unlock premium features to maximize your DECA competition performance. All plans include access to our core practice platform.
                </p>
                
                {/* Stripe Pricing Table */}
                <div className="w-full">
                  <stripe-pricing-table 
                    pricing-table-id="prctbl_1R5Jhc2fAXktF0IPTDZ03BYv"
                    publishable-key={import.meta.env.VITE_STRIPE_PUBLIC_KEY as string}>
                  </stripe-pricing-table>
                </div>
              </div>
              
              <div className="mt-8 border border-primary-100 bg-primary-50 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-gift text-primary-600 text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">Special Offer for Teams</h3>
                    <p className="text-slate-600 mt-1">
                      Are you a DECA advisor or club leader? Get special discounts for group subscriptions with 5+ members.
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button className="mt-4 md:mt-0">Contact Us</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-medal text-primary-600 text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Money-Back Guarantee</h3>
                <p className="text-slate-600">Not satisfied with your subscription? Get a full refund within 14 days of purchase.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-lock text-primary-600 text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
                <p className="text-slate-600">All payments are processed securely through Stripe with bank-level encryption.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-headset text-primary-600 text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Dedicated Support</h3>
                <p className="text-slate-600">All paid plans include priority customer support to answer your questions.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-800">Can I switch plans later?</h3>
                <p className="text-slate-600 mt-2">Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated accordingly.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-800">Do you offer refunds?</h3>
                <p className="text-slate-600 mt-2">Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-800">How do I cancel my subscription?</h3>
                <p className="text-slate-600 mt-2">You can cancel your subscription anytime from your account settings. Your access will continue until the end of your billing period.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-800">Do you offer educational discounts?</h3>
                <p className="text-slate-600 mt-2">Yes, we offer special discounts for schools and DECA chapters. Contact us for more information.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}