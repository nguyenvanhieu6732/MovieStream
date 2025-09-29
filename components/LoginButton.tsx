"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Xin chào {session.user?.name}</p>
        <button onClick={() => signOut()}>Đăng xuất</button>
      </div>
    );
  }
  return <button onClick={() => signIn("google")}>Đăng nhập bằng Google</button>;
}
