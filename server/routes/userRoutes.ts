import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../index.js';

const router = Router();

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { username, email, selectedEvent, onboardingCompleted } = req.body;

    if (!username && !selectedEvent && onboardingCompleted === undefined) {
      return res.status(400).json({ error: "At least one field must be provided" });
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email !== undefined) updateData.email = email || null;
    if (selectedEvent) updateData.selectedEvent = selectedEvent;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    await storage.updateUser(req.user!.id, updateData);

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    res.status(500).json({ 
      error: "Failed to update profile", 
      details: error.message 
    });
  }
});

// Change user's DECA event (one-time only)
router.put('/change-event', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { selectedEvent } = req.body;

    if (!selectedEvent) {
      return res.status(400).json({ error: "Event selection is required" });
    }

    // Check if user has already changed their event
    const user = await storage.getUser(req.user!.id);
    if (user.hasChangedEvent) {
      return res.status(403).json({ 
        error: "You have already used your one-time event change" 
      });
    }

    await storage.updateUser(req.user!.id, {
      selectedEvent,
      hasChangedEvent: true
    });

    res.json({ success: true, message: "Event changed successfully" });
  } catch (error: any) {
    console.error("Error changing event:", error);
    res.status(500).json({ 
      error: "Failed to change event", 
      details: error.message 
    });
  }
});

export default router;