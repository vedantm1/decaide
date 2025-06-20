import InteractionShowcase from "@/components/micro-interactions/interaction-showcase";
import AnimationShowcase from "@/components/micro-interactions/animation-showcase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function InteractionShowcasePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">DecA(I)de Micro-Interactions</h1>
      <p className="text-muted-foreground mb-8">
        This showcase demonstrates the unique micro-interactions that make DecA(I)de more engaging and effective
        than competing platforms. These features are designed to boost student retention, motivation, and enjoyment.
      </p>
      
      <Tabs defaultValue="animations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="interactions">Interactive Elements</TabsTrigger>
          <TabsTrigger value="animations">Animation Library</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interactions">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Interactive Elements</h2>
            <p className="text-muted-foreground mb-4">
              Test our interactive UI elements that respond to user actions and provide immediate feedback.
            </p>
            <InteractionShowcase />
          </Card>
        </TabsContent>
        
        <TabsContent value="animations">
          <AnimationShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
}