export function validateRegistration(data: {
  email: string;
  password: string;
  name: string;
}): { valid: true } | { valid: false; error: string } {
  if (!data.email || !data.email.includes("@")) {
    return { valid: false, error: "Valid email is required" };
  }
  if (!data.password || data.password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  return { valid: true };
}
