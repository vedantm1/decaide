import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ArrowLeft, ArrowRight, Play, SkipForward, ChevronDown } from "lucide-react";

interface OnboardingOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

const DECA_CAREER_CLUSTERS = {
  "Business Administration Core": [
    { name: "Principles of Business Management and Administration", abbrev: "PBM" },
    { name: "Principles of Entrepreneurship", abbrev: "PEN" },
    { name: "Principles of Finance", abbrev: "PFN" },
    { name: "Principles of Hospitality and Tourism", abbrev: "PHT" },
    { name: "Principles of Marketing", abbrev: "PMK" }
  ],
  "Business Management & Administration": [
    { name: "Business Law and Ethics Team Decision Making", abbrev: "BLTDM" },
    { name: "Human Resources Management Series", abbrev: "HRM" },
    { name: "Business Services Operations Research", abbrev: "BOR" },
    { name: "Business Solutions Project", abbrev: "PMBS" },
    { name: "Career Development Project", abbrev: "PMCD" },
    { name: "Community Awareness Project", abbrev: "PMCA" },
    { name: "Community Giving Project", abbrev: "PMCG" }
  ],
  "Entrepreneurship": [
    { name: "Entrepreneurship Team Decision Making", abbrev: "ETDM" },
    { name: "Entrepreneurship Series", abbrev: "ENT" },
    { name: "Business Growth Plan", abbrev: "EBG" },
    { name: "Franchise Business Plan", abbrev: "EFB" },
    { name: "Independent Business Plan", abbrev: "EIB" },
    { name: "Innovation Plan", abbrev: "EIP" },
    { name: "International Business Plan", abbrev: "IBP" },
    { name: "Start-Up Business Plan", abbrev: "ESB" }
  ],
  "Finance": [
    { name: "Financial Services Team Decision Making", abbrev: "FTDM" },
    { name: "Accounting Applications Series", abbrev: "ACT" },
    { name: "Business Finance Series", abbrev: "BFS" },
    { name: "Finance Operations Research", abbrev: "FOR" },
    { name: "Financial Consulting", abbrev: "FCE" },
    { name: "Financial Literacy Project", abbrev: "PMFL" }
  ],
  "Hospitality & Tourism": [
    { name: "Hospitality Services Team Decision Making", abbrev: "HTDM" },
    { name: "Travel and Tourism Team Decision Making", abbrev: "TTDM" },
    { name: "Hotel and Lodging Management Series", abbrev: "HLM" },
    { name: "Quick Serve Restaurant Management Series", abbrev: "QSRM" },
    { name: "Restaurant and Food Service Management Series", abbrev: "RFSM" },
    { name: "Hospitality and Tourism Operations Research", abbrev: "HTOR" },
    { name: "Hospitality and Tourism Professional Selling", abbrev: "HTPS" }
  ],
  "Marketing": [
    { name: "Buying and Merchandising Team Decision Making", abbrev: "BTDM" },
    { name: "Marketing Management Team Decision Making", abbrev: "MTDM" },
    { name: "Sports and Entertainment Marketing Team Decision Making", abbrev: "STDM" },
    { name: "Apparel and Accessories Marketing Series", abbrev: "AAM" },
    { name: "Automotive Services Marketing Series", abbrev: "ASM" },
    { name: "Business Services Marketing Series", abbrev: "BSM" },
    { name: "Food Marketing Series", abbrev: "FMS" },
    { name: "Buying and Merchandising Operations Research", abbrev: "BMOR" },
    { name: "Sports and Entertainment Marketing Operations Research", abbrev: "SEOR" },
    { name: "Marketing Communications Series", abbrev: "MCS" },
    { name: "Retail Merchandising Series", abbrev: "RMS" },
    { name: "Sports and Entertainment Marketing Series", abbrev: "SEM" },
    { name: "Integrated Marketing Campaign-Event", abbrev: "IMCE" },
    { name: "Integrated Marketing Campaign-Product", abbrev: "IMCP" },
    { name: "Integrated Marketing Campaign-Service", abbrev: "IMCS" },
    { name: "Sales Project", abbrev: "PMSP" },
    { name: "Professional Selling", abbrev: "PSE" }
  ],
  "Personal Financial Literacy": [
    { name: "Personal Financial Literacy", abbrev: "PFL" }
  ]
};

const TUTORIAL_STEPS = [
  {
    title: "Dashboard",
    description: "Your Dashboard displays your practice stats—role-plays completed, practice tests taken, PIs mastered, and current streak.",
    selector: "[data-tutorial='dashboard']",
    position: { x: 300, y: 100 }
  },
  {
    title: "Practice Tests", 
    description: "Tap 'Practice Tests' to jump into written exam simulations and track your scores.",
    selector: "[data-tutorial='practice-tests']",
    position: { x: 300, y: 150 }
  },
  {
    title: "Roleplay",
    description: "Select 'Roleplay' to practice scenario conversations with AI and review transcripts.",
    selector: "[data-tutorial='roleplay']", 
    position: { x: 300, y: 200 }
  },
  {
    title: "Written Events",
    description: "Under 'Written Events,' find prompts for written performance events.",
    selector: "[data-tutorial='written-events']",
    position: { x: 300, y: 250 }
  },
  {
    title: "Performance Indicators",
    description: "Browse all PIs here—tap any to see definitions, examples, and practice questions.",
    selector: "[data-tutorial='performance-indicators']",
    position: { x: 300, y: 300 }
  },
  {
    title: "My Progress", 
    description: "Check your mastery timeline, badges, and goals on 'My Progress.'",
    selector: "[data-tutorial='my-progress']",
    position: { x: 300, y: 350 }
  },
  {
    title: "Settings",
    description: "Open 'Settings' to customize your experience, adjust notifications, or log out.",
    selector: "[data-tutorial='settings']",
    position: { x: 300, y: 400 }
  }
];

export function OnboardingOverlay({
  isOpen,
  onComplete,
  userName = "User",
}: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState<"welcome" | "tutorial" | "event-selection">("welcome");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState<{ [cluster: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartTutorial = () => {
    setCurrentStep("tutorial");
    setTutorialStep(0);
  };
  const handleSkipTutorial = () => setCurrentStep("event-selection");
  const handleNextStep = () => {
    tutorialStep < TUTORIAL_STEPS.length - 1
      ? setTutorialStep(tutorialStep + 1)
      : setCurrentStep("event-selection");
  };
  const handlePrevStep = () => tutorialStep > 0 && setTutorialStep(tutorialStep - 1);

  const handleEventSelect = (cluster: string, eventValue: string) => {
    setErrorMessage("");
    const newSel = { ...selectedEvents };
    if (eventValue) {
      // clear other clusters
      Object.keys(newSel).forEach((k) => k !== cluster && delete newSel[k]);
      newSel[cluster] = eventValue;
    } else {
      delete newSel[cluster];
    }
    setSelectedEvents(newSel);
  };

  const handleDone = () => {
    const c = Object.keys(selectedEvents).length;
    if (c === 0) return setErrorMessage("Please select an event to continue");
    if (c > 1) return setErrorMessage("You can only choose one event");
    localStorage.setItem("selectedDecaEvent", Object.values(selectedEvents)[0]);
    onComplete();
  };
  const handleQuizStart = () => console.log("Quiz logic to be implemented");

  const selectedCount = Object.keys(selectedEvents).length;
  const isDoneActive = selectedCount === 1;

  // ───── TUTORIAL BLUR/UNBLUR ─────
  useEffect(() => {
    if (currentStep !== "tutorial") return;

    // 1) cleanup old
    document.querySelectorAll("*").forEach((el) => {
      const e = el as HTMLElement;
      if (e.dataset.tutorialBlurred || e.dataset.tutorialHighlighted) {
        e.style.filter = "";
        e.style.transition = "";
        e.style.zIndex = "";
        e.style.boxShadow = "";
        e.style.background = "";
        e.style.position = "";
        e.style.borderRadius = "";
        delete e.dataset.tutorialBlurred;
        delete e.dataset.tutorialHighlighted;
      }
    });

    // 2) blur main
    const main = document.querySelector("main") as HTMLElement | null;
    if (main) {
      main.style.filter = "blur(3px)";
      main.style.transition = "filter 0.3s ease-in-out";
      main.dataset.tutorialBlurred = "true";
    }

    // 3) blur individual sidebar items except the target
    const step = TUTORIAL_STEPS[tutorialStep];
    const target = document.querySelector(step.selector) as HTMLElement | null;
    const aside = document.querySelector("aside");
    if (aside) {
      aside.querySelectorAll<HTMLElement>("a, div").forEach((item) => {
        // skip if this is (or contains) the highlighted element
        if (target && (item === target || item.contains(target) || target.contains(item))) {
          return;
        }
        item.style.filter = "blur(2px)";
        item.style.transition = "filter 0.3s ease-in-out";
        item.dataset.tutorialBlurred = "true";
      });
    }

    // 4) unblur & highlight the target + its descendants
    if (target) {
      target.style.setProperty("filter", "none", "important");
      target.style.transition = "filter 0.3s ease-in-out";
      target.dataset.tutorialHighlighted = "true";
      delete target.dataset.tutorialBlurred;

      target.querySelectorAll<HTMLElement>("*").forEach((child) => {
        child.style.setProperty("filter", "none", "important");
        delete child.dataset.tutorialBlurred;
      });

      // apply highlight ring
      const base = target.getAttribute("style") || "";
      target.setAttribute(
        "style",
        base +
          `
        filter: none !important;
        position: relative !important;
        z-index: 60 !important;
        border-radius: 8px !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        background: rgba(59, 130, 246, 0.1) !important;
        transition: all 0.3s ease-in-out !important;
      `
      );

      // ensure no parent blur
      let p = target.parentElement;
      while (p && p !== document.body) {
        if (p.style.filter.includes("blur")) {
          p.style.setProperty("filter", "none", "important");
        }
        p = p.parentElement;
      }
    }

    // teardown on next step or end
    return () => {
      document.querySelectorAll("*").forEach((el) => {
        const e = el as HTMLElement;
        if (e.dataset.tutorialBlurred || e.dataset.tutorialHighlighted) {
          e.style.filter = "";
          e.style.transition = "";
          e.style.zIndex = "";
          e.style.boxShadow = "";
          e.style.background = "";
          e.style.position = "";
          e.style.borderRadius = "";
          delete e.dataset.tutorialBlurred;
          delete e.dataset.tutorialHighlighted;
        }
      });
    };
  }, [currentStep, tutorialStep]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {currentStep === "welcome" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">
                  🎉 Congrats, {userName}! Welcome to Decaide!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button onClick={handleStartTutorial} className="flex-1 gap-2">
                    <Play className="h-4 w-4" /> Start Tutorial
                  </Button>
                  <Button onClick={handleSkipTutorial} variant="outline" className="flex-1 gap-2">
                    <SkipForward className="h-4 w-4" /> Skip Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "tutorial" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: -20 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: TUTORIAL_STEPS[tutorialStep].position.x,
              y: TUTORIAL_STEPS[tutorialStep].position.y,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="max-w-sm w-full fixed z-[70]"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {TUTORIAL_STEPS[tutorialStep].title}
                  <span className="text-sm text-muted-foreground">
                    {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{TUTORIAL_STEPS[tutorialStep].description}</p>
                <div className="flex items-center justify-between">
                  <Button onClick={handlePrevStep} disabled={tutorialStep === 0} variant="outline" size="sm" className="gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back
                  </Button>
                  <Button onClick={handleNextStep} size="sm" className="gap-1">
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <button onClick={handleSkipTutorial} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                  Skip Tutorial
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "event-selection" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* ... your event-selection JSX ... */}
            {/* same as before */}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}