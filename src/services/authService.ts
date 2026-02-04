import type { User, UserRole } from "@/types";

// ==========================================
// AUTH SERVICE (Connected to Backend)
// ==========================================

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  city?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Map backend user to frontend user
      const user: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        city: data.city,
        profilePhoto: data.profilePhoto,
        assignedBus: data.assignedBus,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-updated'));

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error. Is the backend running?' };
    }
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const dataRes = await response.json();

      if (!response.ok) {
        return { success: false, error: dataRes.message || 'Registration failed' };
      }

      const user: User = {
        id: dataRes._id,
        name: dataRes.name,
        email: dataRes.email,
        role: dataRes.role,
        phone: dataRes.phone,
        city: dataRes.city,
        profilePhoto: dataRes.profilePhoto,
        assignedBus: dataRes.assignedBus,
        createdAt: dataRes.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-updated'));

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  },

  // Logout
  async logout(): Promise<void> {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
  },

  // Get current user (from local storage)
  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Update user profile
  async updateUserProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Update failed' };
      }

      const updatedUser: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        city: data.city,
        profilePhoto: data.profilePhoto,
        assignedBus: data.assignedBus,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  },

  // Upload profile image
  async uploadProfileImage(userId: string, file: File): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);

      const response = await fetch('/api/users/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Upload failed' };
      }

      // Update local storage user with new photo
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        currentUser.profilePhoto = data.profilePhoto;
        localStorage.setItem('user', JSON.stringify(currentUser));
        window.dispatchEvent(new Event('user-updated'));
      }

      return { success: true, user: currentUser || undefined };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    // Placeholder - implement backend endpoint later
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, message: "Password reset link sent to your email" };
  },
};

export default authService;
