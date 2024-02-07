import { HttpsError, CallableRequest } from 'firebase-functions/v2/https';

// Private functions
export const checkAuth = (
  auth: CallableRequest['auth'],
  production = false,
): void => {
  const permission = production ? auth?.token.admin : auth?.token.devAdmin;

  if (!permission) {
    throw new HttpsError(
      'permission-denied',
      'You do not have sufficient permissions.',
    );
  }
};
