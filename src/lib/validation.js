/**
 * Validation utility functions
 */

export function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let strength;
  if (metRequirements <= 2) {
    strength = 'weak';
  } else if (metRequirements <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    strength,
    requirements,
  };
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateName(name) {
  return name.trim().length >= 2;
}

export function getPasswordStrengthColor(strength) {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
  }
}

export function getPasswordStrengthPercentage(strength) {
  switch (strength) {
    case 'weak':
      return 33;
    case 'medium':
      return 66;
    case 'strong':
      return 100;
  }
}
