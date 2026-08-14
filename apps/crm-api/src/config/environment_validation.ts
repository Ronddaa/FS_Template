//src/config/environment_validation.ts

const MIN_SECRET_LENGTH = 43;

export function validate_environment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const requierd_variables = [
    'DATABASE_URL',
    'AUTH_ACCESS_TOKEN_SECRET',
    'AUTH_REGISTRATION_CODE_SECRET',
  ] as const;

  for (const variable_name of requierd_variables) {
    const value = environment[variable_name];

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Environment variable ${variable_name} is not defiend`);
    }
  }

  const access_token_secret = environment.AUTH_ACCESS_TOKEN_SECRET as string;
  const registration_code_secret =
    environment.AUTH_REGISTRATION_CODE_SECRET as string;

  if (access_token_secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      'AUTH_ACCESS_TOKEN_SECRET must be contain at least 43 characters',
    );
  }

  if (registration_code_secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      'AUTH_ACCESS_TOKEN_SECRET must be contain at least 43 characters',
    );
  }

  if (access_token_secret === registration_code_secret) {
    throw new Error('Authentication secrets must contain different values');
  }

  return environment;
}
