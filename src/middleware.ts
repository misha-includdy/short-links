import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth;

export const config = {
  matcher: ["/api/example/:path*", "/api/generate/:path*", "/api/links/:path*"],
}; 