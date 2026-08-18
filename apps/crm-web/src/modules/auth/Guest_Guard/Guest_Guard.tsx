"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../Auth_Provider/Auth_Provider";

type T_Guest_Guard_Props = {
  children: ReactNode;
};

export default function Guest_Guard({ children }: T_Guest_Guard_Props) {
  const router = useRouter();
  const { auth_status } = useAuth();

  useEffect(() => {
    if (auth_status === "AUTHENTICATED") {
      router.replace("/");
    }
  }, [auth_status, router]);

  if (auth_status === "CHECKING") {
    return <p>Checking session...</p>;
  }

  if (auth_status === "AUTHENTICATED") {
    return null;
  }

  return children;
}