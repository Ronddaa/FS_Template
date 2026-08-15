"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../Auth_Provider/Auth_Provider";

type T_Auth_Guard_Props = {
  children: ReactNode;
};

export default function Auth_Guard({ children }: T_Auth_Guard_Props) {
  const router = useRouter();
  const { auth_status } = useAuth();

  useEffect(() => {
    if (auth_status === "ANONYMOUS") {
      router.replace("/login");
    }
  }, [auth_status, router]);

  if (auth_status === "CHECKING") {
    return <p>Checking session...</p>;
  }

  if (auth_status === "ANONYMOUS") {
    return null;
  }

  return children;
}
