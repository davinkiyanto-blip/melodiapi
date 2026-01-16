/**
 * Utility functions for validation and polling
 */

/**
 * Delay function to wait for specified milliseconds
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validate input according to customMode rules
 */
export interface GeneratePayload {
  customMode: boolean;
  instrumental: boolean;
  prompt?: string;
  style?: string;
  title?: string;
  model?: string;
  negativeTags?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInput(body: any): ValidationResult {
  const errors: string[] = [];

  if (body.customMode === true) {
    // Custom Mode Validation
    if (!body.style) {
      errors.push("In customMode, 'style' is required");
    } else if (typeof body.style !== "string" || body.style.length > 1000) {
      errors.push("'style' must be a string with max 1000 characters");
    }

    if (!body.title) {
      errors.push("In customMode, 'title' is required");
    } else if (typeof body.title !== "string" || body.title.length > 80) {
      errors.push("'title' must be a string with max 80 characters");
    }

    if (body.instrumental === true) {
      // Instrumental custom mode - prompt is optional/ignored
      if (body.prompt) {
        body.prompt = ""; // Clear prompt for instrumental
      }
    } else {
      // Non-instrumental custom mode - prompt is required
      if (!body.prompt) {
        errors.push("In customMode with instrumental=false, 'prompt' is required");
      } else if (typeof body.prompt !== "string" || body.prompt.length > 5000) {
        errors.push("'prompt' must be a string with max 5000 characters");
      }
    }
  } else {
    // Non-Custom Mode Validation (customMode === false)
    if (!body.prompt) {
      errors.push("In non-customMode, 'prompt' is required");
    } else if (typeof body.prompt !== "string" || body.prompt.length > 400) {
      errors.push("'prompt' must be a string with max 400 characters in non-customMode");
    }

    if (body.title && (typeof body.title !== "string" || body.title.length > 80)) {
      errors.push("'title' must be a string with max 80 characters");
    }

    // In non-custom mode, style should be empty
    if (body.style && body.style !== "") {
      errors.push("In non-customMode, 'style' should be empty");
    }
  }

  // Validate instrumental is boolean
  if (typeof body.instrumental !== "boolean") {
    errors.push("'instrumental' must be a boolean");
  }

  // Validate model if provided
  if (body.model && typeof body.model !== "string") {
    errors.push("'model' must be a string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Poll task status until completion
 */
export interface TaskData {
  status: string;
  ok?: boolean;
  records?: any[];
  [key: string]: any;
}

export async function pollTask(taskUrl: string, apiKey: string): Promise<TaskData> {
  const maxAttempts = 60; // Max 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(taskUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const data: TaskData = await response.json();

      // Check if request failed
      if (data.ok === false) {
        // If still pending, continue polling
        if (data.status === "pending" || data.status === "processing") {
          await delay(5000);
          attempts++;
          continue;
        }
        // Otherwise it's a real error
        throw new Error(`Generation failed with status: ${data.status}. Details: ${JSON.stringify(data)}`);
      }

      if (data.status === "done") {
        return data;
      } else if (data.status === "failed") {
        throw new Error(`Generation failed with status: ${data.status}. Details: ${JSON.stringify(data)}`);
      }

      // Status is pending or processing, wait 5 seconds
      if (data.status === "pending" || data.status === "processing") {
        await delay(5000);
        attempts++;
      } else {
        // Unknown status
        throw new Error(`Unknown task status: ${data.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Generation failed")) {
        throw error;
      }
      // Network or other error, retry
      await delay(5000);
      attempts++;
    }
  }

  throw new Error("Task polling timeout: Generation took too long (> 5 minutes)");
}
