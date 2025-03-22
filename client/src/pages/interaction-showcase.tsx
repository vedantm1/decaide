import InteractionShowcase from "@/components/micro-interactions/interaction-showcase";

export default function InteractionShowcasePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">DecA(I)de Micro-Interactions</h1>
      <p className="text-muted-foreground mb-8">
        This showcase demonstrates the unique micro-interactions that make DecA(I)de more engaging and effective
        than competing platforms. These features are designed to boost student retention, motivation, and enjoyment.
      </p>
      
      <InteractionShowcase />
    </div>
  );
}