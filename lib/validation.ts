export function passwordIssues(password: string) {
  const issues: string[] = [];
  if (password.length < 6) issues.push("At least 6 characters");
  if (!/[A-Z]/.test(password)) issues.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("At least one lowercase letter");
  return issues;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function normalizeError(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  const candidate = error as { message?: string; error?: { message?: string } };
  return candidate.message ?? candidate.error?.message ?? fallback;
}
