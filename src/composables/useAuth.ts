import { ref, computed } from 'vue';
import ApiClient from '../api';

export interface UserPermission {
  id: number;
  name: string;
  display_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  deactivated_at: string | null;
  role?: string;
  permissions?: UserPermission[];
  created_at: string;
  updated_at: string;
}

interface Auth {
  user: User;
  token: string;
}

const user = ref<User>();
const token = ref<string>();
const AUTH_STORAGE_KEY = "__mizu_portal_session_user_key__";
const AUTH_LOCAL_STORAGE_KEY = "__mizu_portal_local_user_key__";
const isAuthenticated = computed(() => !!token.value);
const displayName = computed(() => user.value?.name || user.value?.email || 'User');

/**
 * Authenticates a user with the provided credentials
 *
 * @param identifier - User's email address or phone number
 * @param password - User's password
 * @param rememberMe - Whether to persist the session across browser sessions
 * @returns Promise that resolves when login is complete
 */
async function login(identifier: string, password: string, rememberMe: boolean = false) {
  const payload: Record<string, string> = { password };
  if(identifier.includes('@')) {
    payload.email = identifier;
  } else {
    payload.phoneNumber = identifier;
  }
  
  const auth = await ApiClient.postJson<Auth>('auth/login/', payload);
  token.value = auth.token;
  user.value = auth.user;
 
  if (rememberMe) {
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(auth));
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }
};

/**
 * Logs out the current user by clearing authentication data
 */
async function logout() {
  // Clear the user and token data
  user.value = undefined;
  token.value = undefined;

  // Clear both storage locations
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);

  window.location.reload();
}

export default function useAuth() {
  // If not already authenticated, try to restore session
  if (!isAuthenticated.value) {
    // First check session storage (non-persistent)
    let auth = sessionStorage.getItem(AUTH_STORAGE_KEY);

    // If not in session storage, check local storage (persistent)
    if (!auth) {
      auth = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
    }

    // If found in either storage, restore the session
    if (auth) {
      try {
        const _auth: Auth = JSON.parse(auth as string);
        user.value = _auth.user;
        token.value = _auth.token;
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
      }
    }
  }

  return {
    user,
    isAuthenticated,
    displayName,
    token,
    login,
    logout,
  };
}
