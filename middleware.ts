import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // nếu chưa đăng nhập -> redirect về /login
  },
});

export const config = {
  matcher: ["/profile/:path*", "/watchlist/:path*"],
};
