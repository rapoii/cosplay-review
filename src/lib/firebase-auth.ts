import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

let auth: Auth | undefined;

export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available in the browser.');
  }

  const requiredConfig = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId];
  if (requiredConfig.some((value) => !value || value.startsWith('your_'))) {
    throw new Error('firebase-config-missing');
  }

  if (!auth) {
    const app = initializeApp(firebaseConfig, 'admin-auth');
    auth = getAuth(app);
  }

  return auth;
}
