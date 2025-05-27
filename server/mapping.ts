import { Router, Request, Response } from "express";
import events from "../events.json";
import pis from "../pis.json";

const router = Router();

router.post("/enrich", (req: Request, res: Response) => {
  const { event_code, pi_code } = req.body;

  // Find the event and PI by code
  const event = (events as any[]).find(e => e.event_code === event_code) || {};
  const pi = (pis as any[]).find(p => p.pi_code === pi_code) || {};

  res.json({
    cluster: event.cluster || "",
    event_name: event.event_name || "",
    instructional_area: pi.instructional_area || "",
    pi_description: pi.description || "",
    content_type: event_code ? "Roleplay" : "Unknown"
  });
});

export default router;
