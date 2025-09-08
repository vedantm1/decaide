import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Gamepad2, Star, Trophy, Clock } from "lucide-react";
import { DECABlocGame } from "@/components/games/deca-bloc";

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame === 'deca-bloc') {
    return <DECABlocGame onBack={() => setSelectedGame(null)} />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            DECA Games
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Learn DECA concepts while having fun with our educational games
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* DECA Bloc Game */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Gamepad2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    New
                  </Badge>
                </div>
                <CardTitle className="text-xl">DECA Bloc</CardTitle>
                <CardDescription>
                  A tile-matching puzzle game where correct DECA answers earn you blocks to clear lines
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>Educational</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>Competitive</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>5-15 min</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">How to Play:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Answer DECA questions correctly to earn blocks</li>
                      <li>• Place blocks on the 10×10 grid strategically</li>
                      <li>• Clear lines to score points and make space</li>
                      <li>• Wrong answers place penalty blocks</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => setSelectedGame('deca-bloc')}
                    className="w-full mt-4"
                  >
                    Play DECA Bloc
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coming Soon Games */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="h-full opacity-60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardTitle className="text-xl">DECA Quiz Rush</CardTitle>
                <CardDescription>
                  Fast-paced question competition against the clock
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="h-full opacity-60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardTitle className="text-xl">Memory Match</CardTitle>
                <CardDescription>
                  Match DECA terms with their definitions in this memory game
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Game Stats</h3>
          <div className="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div>Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div>High Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div>Questions Answered</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}