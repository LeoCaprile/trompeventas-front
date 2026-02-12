import { isHTTPError } from "ky";
import { serverApiClient } from "../client";
import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "react-router";
import { FormStrategy } from "remix-auth-form";

export interface UserSignInData {
  email: string;
  password: string;
}

export interface UserSignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInResponse {
  user: UserT;
  accessToken: string;
  refreshToken: string;
}

export interface UserT {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  region: string;
  city: string;
  createdAt: string;
}

export async function signIn(userData: UserSignInData): Promise<SignInResponse> {
  try {
    const response = await serverApiClient
      .post("auth/sign-in", {
        json: userData,
      })
      .json<SignInResponse>();
    return response;
  } catch (error) {
    if (isHTTPError(error)) {
      const errorResponse: { error: string } = await error.response.json();
      console.error(
        `[ERROR]:[${error.response.status}]:[${errorResponse.error}]`,
      );
      throw Error(errorResponse.error);
    }
    console.error(`[ERROR]:[${error}]`);
    throw error;
  }
}

export async function signUp(userData: UserSignUpData) {
  try {
    const response = await serverApiClient
      .post<{ user: UserT }>("auth/sign-up", {
        json: userData,
      })
      .json();
    return response.user;
  } catch (error) {
    if (isHTTPError(error)) {
      const errorResponse: { error: string } = await error.response.json();
      console.error(
        `[ERROR]:[${error.response.status}]:[${errorResponse.error}]`,
      );
      throw Error(errorResponse.error);
    }
    console.error(`[ERROR]:[${error}]`);
    throw error;
  }
}

export async function signOut(refreshToken: string) {
  try {
    await serverApiClient.post("auth/sign-out", {
      json: { refreshToken },
    });
  } catch (error) {
    console.error(`[ERROR]:[${error}]`);
    throw error;
  }
}

export async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const response = await serverApiClient
      .post("auth/refresh", {
        json: { refreshToken },
      })
      .json<{ accessToken: string; refreshToken: string }>();
    return response;
  } catch (error) {
    throw error;
  }
}

export async function exchangeOAuthCode(
  code: string,
): Promise<SignInResponse> {
  try {
    const response = await serverApiClient
      .post("auth/oauth/google/exchange", {
        json: { code },
      })
      .json<SignInResponse>();
    return response;
  } catch (error) {
    if (isHTTPError(error)) {
      const errorResponse: { error: string } = await error.response.json();
      throw Error(errorResponse.error);
    }
    throw error;
  }
}

export async function getGoogleOAuthUrl(): Promise<string> {
  try {
    const response = await serverApiClient
      .get("auth/oauth/google")
      .json<{ authUrl: string }>();
    return response.authUrl;
  } catch (error) {
    if (isHTTPError(error)) {
      const errorResponse: { error: string } = await error.response.json();
      console.error(
        `[ERROR]:[${error.response.status}]:[${errorResponse.error}]`,
      );
      throw Error(errorResponse.error);
    }
    console.error(`[ERROR]:[${error}]`);
    throw error;
  }
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"], // TODO: Move to environment variable
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days — matches refresh token duration
  },
});

export const authenticator = new Authenticator<SignInResponse>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    return await signIn({ email, password });
  }),
  "user-pass",
);
