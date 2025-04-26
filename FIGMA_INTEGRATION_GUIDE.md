# Figma Integration Guide for DecA(I)de

This document outlines how to utilize Figma designs within the DecA(I)de platform development workflow.

## Overview

DecA(I)de's UI/UX is designed using Figma, with a Memphis-style design system that incorporates playful patterns, vibrant colors, and geometric shapes. This guide explains how to access, implement, and maintain design consistency using the Figma-Replit integration.

## Design System

The DecA(I)de design system includes:

1. **Color Palette**
   - Primary Brand Colors: Memphis blue, coral, and yellow
   - Secondary Colors: Pastels and high-contrast accents
   - Dark/Light Mode Variants

2. **Typography**
   - Headings: Poppins (Bold, Semi-Bold)
   - Body: Inter (Regular, Medium)
   - Special Elements: Montserrat for feature highlights

3. **Components**
   - Navigation elements (Top bar, sidebar)
   - Cards (Role play scenarios, quizzes, challenges)
   - Diego Chat Interface
   - Progress indicators and badges
   - Subscription tier displays

## Connecting to Figma

Follow the instructions in [REPLIT_FIGMA_CONNECTION.md](./REPLIT_FIGMA_CONNECTION.md) to establish a connection between this Replit project and the Figma design files.

## Implementation Workflow

1. **Access Design Assets**
   - Connect to Figma using the provided scripts
   - Navigate to the DecA(I)de design file
   - Use Dev Mode to export components and styles

2. **Implement UI Components**
   - Extract design tokens (colors, spacing, typography)
   - Implement components using shadcn/ui and Tailwind CSS
   - Follow the Memphis design principles for consistency

3. **Animation System**
   - Implement the animation system as per Figma prototypes
   - Use Framer Motion for consistent animations
   - Follow the animation timing and easing curves from the design system

## Memphis Style Implementation Guidelines

The Memphis design style is characterized by:

1. **Bold Geometric Patterns**
   - Use the provided pattern SVGs for backgrounds and decorative elements
   - Implement as CSS backgrounds or SVG components

2. **Vibrant Color Blocks**
   - Use high-contrast color combinations
   - Implement color transitions for interactive elements

3. **Playful Typography**
   - Use the specified font pairings
   - Implement the typographic scale as defined in the design system

4. **Asymmetric Layouts**
   - Follow the grid system while allowing for playful misalignments
   - Maintain content hierarchy despite the playful layout

## Responsive Design

DecA(I)de requires responsive implementations across:

1. Desktop (1280px+)
2. Tablet (768px - 1279px)
3. Mobile (320px - 767px)

The Figma designs include breakpoint variations for each key screen.

## Accessibility Considerations

While implementing the Memphis style, ensure:

1. Sufficient color contrast for text (WCAG AA compliance)
2. Proper focus states for keyboard navigation
3. Appropriate text sizes for readability
4. Alternative styling for reduced-motion preferences

## Design-to-Code Workflow

1. Extract design tokens from Figma (colors, spacing, typography)
2. Update the theme configuration (`theme.json`)
3. Implement components using shadcn/ui with the extracted design tokens
4. Verify implementations against designs using the comparison tool

## Getting Help

If you encounter design implementation challenges:

1. Check comments in the Figma file for designer notes
2. Use the design system documentation
3. Consult the UI component reference implementation examples