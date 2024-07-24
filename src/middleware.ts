import { NextRequest, NextResponse } from "next/server";
import { handleError } from "./utilities/handleError";
import { SingleResponse } from "./models";
import { Role } from "./constants/role";

const getRole = async (
  token: string | undefined
): Promise<SingleResponse<Role> | undefined> => {
  if (!token || !process.env.NEXT_PUBLIC_API_URL) return;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  } catch (e: any) {
    handleError(e);
  }
};

const authPaths = [
  "/account",
  "/cart",
  "/checkout",
  "/instant-checkout",
  "/favorite",
];
const userPaths = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken");
  const url = request.nextUrl.pathname;
  if (!accessToken) {
    const refreshToken = request.cookies.get("refreshToken");
    if (!refreshToken) {
      if (
        authPaths.includes(url) ||
        url.startsWith("/account") ||
        url.startsWith("/admin") ||
        url.startsWith("/shipper")
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }
  const userRole = await getRole(accessToken?.value);
  if (userRole?.result == "CUSTOMER") {
    if (
      userPaths.includes(url) ||
      url.startsWith("/admin") ||
      url.startsWith("/shipper")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (userRole?.result == "ADMIN" && url.includes("admin") == false) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (userRole?.result == "SHIPPER" && url.includes("shipper") == false) {
    return NextResponse.redirect(new URL("/shipper", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/account/:path*",
    "/forgot-password",
    "/login",
    "/product",
    "/favorite",
    "/cart",
    "/checkout",
    "/instant-checkout",
    "/shipper",
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
