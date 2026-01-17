/**
 * Vercel API Handler for Suno Music Generation
 * POST /api/generate
 * 
 * This handler orchestrates:
 * 1. Input validation
 * 2. API request initiation to PaxSenix
 * 3. Status polling every 5 seconds
 * 4. Response transformation (creator field)
 * 5. Final response to client
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { validateInput, pollTask, GeneratePayload } from "./utils";

// Types for response
interface InitResponse {
  ok: boolean;
  task_url?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

interface FinalResponse {
  creator?: string;
  ok: boolean;
  status: string;
  records?: any[];
  completedAt?: string;
  [key: string]: any;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (request.method !== "POST") {
    return void response.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST requests are supported",
    });
  }

  try {
    // Get environment variables
    const {
      SUNO_BASE_URL,
      SUNO_ENDPOINT_GENERATE,
      SUNO_API_KEY,
      CREATOR_NAME,
    } = process.env;

    // Validate environment variables
    if (!SUNO_BASE_URL || !SUNO_ENDPOINT_GENERATE || !SUNO_API_KEY || !CREATOR_NAME) {
      console.error("Missing environment variables");
      return void response.status(500).json({
        error: "Server Configuration Error",
        message: "Missing required environment variables",
      });
    }

    // Parse and validate request body
    const body: GeneratePayload = request.body;

    if (!body) {
      return void response.status(400).json({
        error: "Bad Request",
        message: "Request body is required",
      });
    }

    // Validate input according to PRD rules
    const validation = validateInput(body);
    if (!validation.valid) {
      return void response.status(400).json({
        error: "Validation Failed",
        details: validation.errors,
      });
    }

    console.log("Input validation passed, initiating Suno generation...");

    // Step 2: Send request to PaxSenix to initiate generation
    const initUrl = `${SUNO_BASE_URL}${SUNO_ENDPOINT_GENERATE}`;
    const initResponse = await fetch(initUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const initData = (await initResponse.json()) as InitResponse;

    console.log("Init response status:", initData.status);
    console.log("Init response ok:", initData.ok);

    if (!initData.ok || !initData.task_url) {
      console.error("Failed to start generation:", initData);
      return void response.status(500).json({
        error: "Failed to start generation",
        details: initData,
      });
    }

    console.log("Generation initiated, task_url:", initData.task_url);

    // Step 3: Poll the task status until completion
    console.log("Starting polling loop...");
    const finalResult = await pollTask(initData.task_url, SUNO_API_KEY);

    console.log("Polling completed, status:", finalResult.status);

    // Step 4: Transform data - change creator field
    const transformedResult: FinalResponse = {
      ...(finalResult as any),
      creator: CREATOR_NAME,
      ok: true,
      completedAt: new Date().toISOString(),
    };

    console.log("Generation completed successfully");

    // Step 5: Return final response
    return void response.status(200).json(transformedResult);
  } catch (error) {
    console.error("Error in generate handler:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("polling timeout") || errorMessage.includes("took too long")) {
      return void response.status(504).json({
        error: "Generation Timeout",
        message: "Music generation took too long. Please try again.",
        details: errorMessage,
      });
    }

    if (errorMessage.includes("Generation failed")) {
      return void response.status(502).json({
        error: "Generation Failed",
        message: "Suno generation process failed",
        details: errorMessage,
      });
    }

    return void response.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred during processing",
      details: errorMessage,
    });
  }
}
