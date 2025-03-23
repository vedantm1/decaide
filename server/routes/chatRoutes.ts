import express, { Request, Response } from 'express';

const router = express.Router();

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Diego chat endpoint
router.post('/diego', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const message = req.body.message;
    
    // Basic response map for common DECA-related questions
    const responses: Record<string, string> = {
      "What are performance indicators?": 
        "Performance Indicators are specific knowledge or skills that you need to demonstrate in DECA competitive events. They serve as a checklist of what judges will be looking for during your presentation.",
      
      "How do I prepare for a roleplay?": 
        "To prepare for a roleplay, familiarize yourself with your event's Performance Indicators, practice quick thinking, study business concepts relevant to your event, use the STAR approach (Situation, Task, Action, Result), and role-play with peers for feedback.",
      
      "Explain the Business Management cluster": 
        "The Business Management & Administration cluster prepares students for careers in planning, organizing, directing and evaluating business functions. Events include Business Management and Administration Series, Human Resources Management Series, and more.",
      
      "What's the format of DECA exams?": 
        "DECA exams typically consist of 100 multiple-choice questions covering business administration core performance indicators and your specific competitive event area. You have 100 minutes to complete the exam.",
      
      "How are written events scored?": 
        "Written events are scored using a rubric that evaluates executive summary, strategic planning, implementation, and presentation skills. Judges assess content knowledge, critical thinking, communication, and professionalism.",
      
      "Tell me about international events": 
        "DECA's International Career Development Conference (ICDC) brings together over 20,000 students from around the world. It's the culmination of competitive events, featuring championships for all DECA event categories."
    };
    
    // Check if the message matches any predefined question
    let response = responses[message];
    
    // If no exact match, provide a helpful default response
    if (!response) {
      if (message.toLowerCase().includes("performance indicator") || message.toLowerCase().includes("pi")) {
        response = "Performance Indicators are essential elements in DECA competitions. They guide what judges are looking for in your presentation and solutions.";
      } else if (message.toLowerCase().includes("roleplay") || message.toLowerCase().includes("role play")) {
        response = "Role plays are simulated business scenarios where you demonstrate your business knowledge and problem-solving skills. Practice is key to success!";
      } else if (message.toLowerCase().includes("exam") || message.toLowerCase().includes("test")) {
        response = "DECA exams test your knowledge of business concepts and principles. Regular study of business terminology and practices will help you succeed.";
      } else if (message.toLowerCase().includes("written") || message.toLowerCase().includes("write")) {
        response = "Written events require thorough research, strategic thinking, and professional presentation. Start early and seek feedback on your work.";
      } else {
        response = "I'm here to help with your DECA preparation! You can ask me about performance indicators, role plays, exam strategies, or written events.";
      }
    }
    
    // Add a short delay to simulate thinking
    setTimeout(() => {
      res.json({ message: response });
    }, 800);
    
  } catch (error) {
    console.error('Error in Diego chat:', error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

export default router;