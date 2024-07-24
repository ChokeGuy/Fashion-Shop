import { OptionsType } from "cookies-next/lib/types";
import { AS_TOKEN_EXPIRE, ENV, RF_TOKEN_EXPIRE } from ".";

const tokenSessionOptions = (tokenType: string): OptionsType => {
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  return {
    // httpOnly: true,
    secure: ENV === "production" ? true : false,
    maxAge: tokenType === "accessToken" ? AS_TOKEN_EXPIRE : RF_TOKEN_EXPIRE,
    // path: "/",
    // domain: ENV === "production" ? "production.com" : "localhost:3000",
  };
};

const sessionOptions = (expiration: number | undefined = 60): OptionsType => {
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  return {
    // httpOnly: true,
    secure: ENV === "production" ? true : false,
    maxAge: expiration,
    // path: "/",
    // domain: ENV === "production" ? "production.com" : "localhost:3000",
  };
};
export { tokenSessionOptions, sessionOptions };
