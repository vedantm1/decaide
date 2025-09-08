import express, { Request, Response } from 'express';
import { verifySupabaseToken } from '../supabase-auth';
import { storage } from '../storage';
import { generateTestQuestions } from '../services/azureOpenai';
import { z } from 'zod';
import { insertGameSessionDECABlocSchema } from '@shared/schema';

const router = express.Router();

// Schema for single question request
const singleQuestionSchema = z.object({
  cluster: z.string().min(1),
  difficulty: z.string().min(1),
  instructionalAreas: z.array(z.string()).optional(),
});

// Generate single question for DECA Bloc game
router.post('/deca-bloc/question', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = singleQuestionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid request data",
        details: validation.error.issues 
      });
    }

    const { cluster, difficulty, instructionalAreas } = validation.data;

    // Generate a single question using the existing test generation service
    const testData = await generateTestQuestions({
      testType: "multiple_choice",
      categories: instructionalAreas || [cluster],
      numQuestions: 1,
      cluster,
      level: difficulty,
      learningMode: false,
    });

    if (!testData.questions || testData.questions.length === 0) {
      return res.status(500).json({ error: "Failed to generate question" });
    }

    // Return the single question with a unique ID
    const question = testData.questions[0];
    res.json({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: question.stem || question.question,  // Use stem as the question text
      options: question.options,
      correctAnswer: question.answer || question.correctAnswer,
      explanation: question.explanation,
      topic: question.instructional_area || question.topic || cluster,
    });

  } catch (error: any) {
    console.error('Error generating game question:', error);
    res.status(500).json({ 
      error: "Failed to generate question", 
      details: error.message 
    });
  }
});

// Save DECA Bloc game session
router.post('/deca-bloc/save', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get user record from database
    const user = await storage.getUserByAuthId(userId);
    if (!user) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Validate the session data
    const sessionData = { ...req.body, userId: user.id };
    const validation = insertGameSessionDECABlocSchema.safeParse(sessionData);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid session data",
        details: validation.error.issues 
      });
    }

    // Save the game session
    const savedSession = await storage.createGameSessionDECABloc(validation.data);

    // Update user points and experience based on performance
    const pointsEarned = Math.floor(validation.data.finalScore / 10); // 1 point per 10 score
    const experienceGained = validation.data.questionsCorrect * 5; // 5 XP per correct answer
    
    await storage.updateUserStats(user.id, {
      points: pointsEarned,
      experience: experienceGained,
    });

    res.json({ 
      message: "Game session saved successfully",
      sessionId: savedSession.id,
      pointsEarned,
      experienceGained,
    });

  } catch (error: any) {
    console.error('Error saving game session:', error);
    res.status(500).json({ 
      error: "Failed to save game session", 
      details: error.message 
    });
  }
});

// Get user's DECA Bloc game history and stats
router.get('/deca-bloc/history', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = await storage.getUserByAuthId(userId);
    if (!user) {
      return res.status(404).json({ error: "User record not found" });
    }

    const history = await storage.getUserGameSessionsDECABloc(user.id);
    
    // Calculate aggregate stats
    const stats = history.reduce((acc, session) => ({
      totalGames: acc.totalGames + 1,
      totalScore: acc.totalScore + session.finalScore,
      totalLinesCleared: acc.totalLinesCleared + session.linesCleared,
      totalQuestionsAnswered: acc.totalQuestionsAnswered + session.questionsAnswered,
      totalQuestionsCorrect: acc.totalQuestionsCorrect + session.questionsCorrect,
      bestScore: Math.max(acc.bestScore, session.finalScore),
      bestStreak: Math.max(acc.bestStreak, session.streakBest),
      totalPlayTime: acc.totalPlayTime + session.totalPlayTime,
    }), {
      totalGames: 0,
      totalScore: 0,
      totalLinesCleared: 0,
      totalQuestionsAnswered: 0,
      totalQuestionsCorrect: 0,
      bestScore: 0,
      bestStreak: 0,
      totalPlayTime: 0,
    });

    const averageAccuracy = stats.totalQuestionsAnswered > 0 
      ? (stats.totalQuestionsCorrect / stats.totalQuestionsAnswered) * 100 
      : 0;

    res.json({
      history: history.slice(0, 10), // Return last 10 games
      stats: {
        ...stats,
        averageScore: stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames) : 0,
        averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      }
    });

  } catch (error: any) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ 
      error: "Failed to fetch game history", 
      details: error.message 
    });
  }
});

export default router;