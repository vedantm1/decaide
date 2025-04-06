import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema.ts';
import 'dotenv/config';

const { Pool } = pg;

// Create a PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle ORM instance
const db = drizzle(pool, { schema });

// Create the missing tables directly without interactive prompts
async function main() {
  console.log('Creating missing tables in the database...');
  
  try {
    // Create user achievements table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "achievements" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "type" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "points" integer NOT NULL,
        "unlocked_at" timestamp
      );
    `);
    
    // Create activities table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "type" text NOT NULL,
        "details" text,
        "points" integer,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create daily challenges table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "daily_challenges" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "type" text NOT NULL,
        "points" integer NOT NULL,
        "date" timestamp NOT NULL,
        "details" text
      );
    `);
    
    // Create user daily challenges table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user_daily_challenges" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "challenge_id" integer NOT NULL,
        "completed" boolean DEFAULT false,
        "completed_at" timestamp
      );
    `);
    
    // Create break sessions table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "break_sessions" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "work_duration" integer NOT NULL,
        "break_duration" integer NOT NULL,
        "completed" boolean DEFAULT false,
        "started_at" timestamp NOT NULL,
        "ended_at" timestamp
      );
    `);
    
    // Create roleplay records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "roleplay_records" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "scenario_id" text,
        "title" text NOT NULL,
        "category" text,
        "feedback" text,
        "score" integer,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create test records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "test_records" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "test_type" text NOT NULL,
        "score" integer NOT NULL,
        "total_questions" integer NOT NULL,
        "correct_answers" integer NOT NULL,
        "categories" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create written event records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "written_records" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "event_code" text,
        "title" text NOT NULL,
        "content" text,
        "feedback" text,
        "score" integer,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    console.log('Database schema updated successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

main();