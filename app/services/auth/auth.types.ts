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
