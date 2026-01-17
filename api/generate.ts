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
import { validateInput, GeneratePayload } from "./utils";

// Types for response
interface InitResponse {
  ok: boolean;
  task_url?: string;
  status?: string;
  message?: string;
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

    // Step 3: Return task_url immediately (Plain Text)
    // The main server will handle polling this URL
    return void response.status(200).send(initData.task_url);

  } catch (error) {
    console.error("Error in generate handler:", error);

    // Errors are still JSON for debugging
    return void response.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
