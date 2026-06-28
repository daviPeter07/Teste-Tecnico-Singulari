import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  AUTH_LOGIN_PATH,
  AUTH_REDIRECT_PATH,
} from "@/modules/auth/types/auth.constants";
import type {
  AuthResponse,
  AuthUser,
  LoginValues,
  RegisterValues,
} from "@/modules/auth/types/auth.types";
import { apiClient } from "@/shared/lib/http/api-client";
import { ApiError } from "@/shared/lib/http/api-error";

const isProduction = process.env.NODE_ENV === "production";

const getCookieStore = async () => cookies();

export const authService = {
  async login(values: LoginValues) {
    return apiClient.post<AuthResponse>("/login", { body: values });
  },

  async register(values: RegisterValues) {
    return apiClient.post<AuthResponse>("/users", { body: values });
  },

  async logout(token?: string) {
    if (!token) {
      return;
    }

    try {
      await apiClient.post<{ message: string }>("/logout", { token });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        return;
      }

      throw error;
    }
  },

  async persistSession(accessToken: string) {
    const cookieStore = await getCookieStore();

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    });
  },

  async clearSession() {
    const cookieStore = await getCookieStore();

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      expires: new Date(0),
    });
  },

  async getSessionToken() {
    const cookieStore = await getCookieStore();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value;
  },

  async getCurrentUser() {
    const token = await this.getSessionToken();

    if (!token) {
      return null;
    }

    try {
      return await apiClient.get<AuthUser>("/me", { token });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        await this.clearSession();
        return null;
      }

      throw error;
    }
  },

  async requireAuthenticatedUser() {
    const user = await this.getCurrentUser();

    if (!user) {
      redirect(AUTH_LOGIN_PATH);
    }

    return user;
  },

  async redirectIfAuthenticated() {
    const user = await this.getCurrentUser();

    if (user) {
      redirect(AUTH_REDIRECT_PATH);
    }
  },
};
