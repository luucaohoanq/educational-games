import api from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  username: string;
  userId: number;
  role: string;
  token?: string;
}

const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  // Store auth data in localStorage
  storeAuthData: (username: string, userId: number, role: string): void => {
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId.toString());
    localStorage.setItem("role", role);
  },

  // Clear auth data from localStorage
  clearAuthData: (): void => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  },

  // Get stored auth data
  getStoredAuthData: (): { username: string | null; userId: number | null; role: string | null } => {
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    return {
      username,
      userId: userId ? parseInt(userId) : null,
      role,
    };
  },
};

export default authService;
