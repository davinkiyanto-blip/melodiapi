/**
 * Utility functions for validation and polling
 */


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

