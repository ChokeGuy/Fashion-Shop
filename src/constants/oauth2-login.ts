const OAUTH2_REDIRECT_PORT = process.env.NEXT_PUBLIC_OAUTH2_REDIRECT_URL;
const OAUTH_2_API_PORT = process.env.NEXT_PUBLIC_OAUTH2_AUTHORIZATION_URL;

const GOOGLE_AUTH_URL =
  OAUTH_2_API_PORT +
  "/oauth2/authorize/google?redirect_uri=" +
  OAUTH2_REDIRECT_PORT;
const FACEBOOK_AUTH_URL =
  OAUTH_2_API_PORT +
  "/oauth2/authorize/facebook?redirect_uri=" +
  OAUTH2_REDIRECT_PORT;

export { OAUTH2_REDIRECT_PORT, GOOGLE_AUTH_URL, FACEBOOK_AUTH_URL };
