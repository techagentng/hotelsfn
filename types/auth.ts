// User interface matching your backend response
export interface User {
  id: string;
  email: string;
  fullname: string;
  username?: string;
  telephone?: string;
  role_name: string;
  token?: string; // JWT token for authentication
}

// Authentication state
export interface AuthState {
  isLoggedIn: boolean;
  isInitialized: boolean;
  user: User | null;
  role_name: string | null;
}

// Google login response from backend
export interface GoogleLoginResponse {
  id: number;
  fullname: string;
  username: string;
  telephone: string;
  email: string;
  role_name: string;
  access_token: string;
  refresh_token: string;
}

// Auth context type
export interface AuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  user: User | null;
  role_name: string | null;
  googleLogin: (email: string, fullname: string, telephone: string) => Promise<void>;
  logout: () => void;
}

// Google OAuth token response
export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

// Decoded Google ID token
export interface GoogleUser {
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string;
}
