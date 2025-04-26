import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Diego3DModel from '@/components/diego-guide/diego-3d-model';

export default function ModelViewerPage() {
  // State for the currently selected emotion
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'excited' | 'confused'>('neutral');
  // State for auto-rotation toggle
  const [autoRotate, setAutoRotate] = useState(true);
  // State for model scale
  const [scale, setScale] = useState(2.5);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">3D Model Viewer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main viewer panel */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-b from-primary/10 to-secondary/5 relative aspect-[4/3]">
              <Diego3DModel 
                emotion={emotion}
                autoRotate={autoRotate}
                scale={scale}
              />
            </div>
          </Card>
        </div>
        
        {/* Controls panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Model Controls</h2>
            
            <div className="space-y-6">
              {/* Emotion selector */}
              <div>
                <h3 className="text-sm font-medium mb-2">Emotion</h3>
                <Tabs defaultValue="neutral" onValueChange={(value) => setEmotion(value as any)}>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="neutral">Neutral</TabsTrigger>
                    <TabsTrigger value="happy">Happy</TabsTrigger>
                    <TabsTrigger value="thinking">Thinking</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="excited">Excited</TabsTrigger>
                    <TabsTrigger value="confused">Confused</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Separator />
              
              {/* Auto-rotate toggle */}
              <div>
                <h3 className="text-sm font-medium mb-2">Auto-Rotation</h3>
                <Button 
                  variant={autoRotate ? "default" : "outline"}
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="w-full"
                >
                  {autoRotate ? "Disable Auto-Rotate" : "Enable Auto-Rotate"}
                </Button>
              </div>
              
              <Separator />
              
              {/* Size controls */}
              <div>
                <h3 className="text-sm font-medium mb-2">Model Size</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setScale(Math.max(1, scale - 0.5))}
                    disabled={scale <= 1}
                  >
                    Smaller
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled
                  >
                    {scale.toFixed(1)}x
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setScale(Math.min(5, scale + 0.5))}
                    disabled={scale >= 5}
                  >
                    Larger
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Info section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Model Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Name: Diego</p>
                  <p>Format: glTF</p>
                  <p>Path: /models/diego.glb</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-6">
                <p>Interact with the model using your mouse:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Click and drag to rotate</li>
                  <li>Scroll to zoom (when enabled)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}