type AuthAction = "signin" | "signup";

function extractErrorDetails(input: unknown): { code: string; message: string; status: number | undefined } {
  const fallback = {
    code: "",
    message: "",
    status: undefined as number | undefined,
  };

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const value = input as Record<string, unknown>;

  const nestedError = value.error;
  if (nestedError && typeof nestedError === "object") {
    const nested = nestedError as Record<string, unknown>;
    return {
      code: typeof nested.code === "string" ? nested.code : "",
      message: typeof nested.message === "string" ? nested.message : "",
      status: typeof nested.status === "number" ? nested.status : undefined,
    };
  }

  return {
    code: typeof value.code === "string" ? value.code : "",
    message: typeof value.message === "string" ? value.message : "",
    status: typeof value.status === "number" ? value.status : undefined,
  };
}

function mapByPattern(raw: string, action: AuthAction): string {
  const text = raw.toLowerCase();

  if (text.includes("failed to fetch") || text.includes("network") || text.includes("econn") || text.includes("timeout")) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (text.includes("emaxconnsession") || text.includes("max clients") || text.includes("pool")) {
    return "Server is busy right now. Please wait a moment and try again.";
  }

  if (text.includes("rate") || text.includes("too many") || text.includes("429")) {
    return "Too many attempts. Please wait and try again.";
  }

  if (text.includes("invalid email") || (text.includes("email") && text.includes("invalid"))) {
    return "Please enter a valid email address.";
  }

  if (text.includes("password") && (text.includes("min") || text.includes("short") || text.includes("least"))) {
    return "Password must be at least 8 characters long.";
  }

  if (action === "signin") {
    if (
      text.includes("invalid credentials") ||
      text.includes("wrong password") ||
      text.includes("invalid password") ||
      text.includes("user not found") ||
      text.includes("email not found")
    ) {
      return "Email or password is incorrect.";
    }

    return "Sign in failed. Please check your credentials and try again.";
  }

  if (
    text.includes("already exists") ||
    text.includes("duplicate") ||
    text.includes("unique") ||
    text.includes("taken")
  ) {
    return "An account with this email already exists.";
  }

  return "Sign up failed. Please check the details and try again.";
}

export function getAuthErrorMessage(error: unknown, action: AuthAction): string {
  if (error instanceof Error && error.message) {
    return mapByPattern(error.message, action);
  }

  const details = extractErrorDetails(error);
  const composed = [details.code, details.message, details.status ? String(details.status) : ""]
    .filter(Boolean)
    .join(" ");

  if (composed) {
    return mapByPattern(composed, action);
  }

  return action === "signin"
    ? "Sign in failed. Please try again."
    : "Sign up failed. Please try again.";
}
