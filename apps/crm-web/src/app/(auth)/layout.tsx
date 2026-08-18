import Guest_Guard from "@/modules/auth/Guest_Guard/Guest_Guard";
import type { ReactNode } from "react";

type T_Auth_Layout_Props = {
  children: ReactNode;
};

export default function Auth_Layout({ children }: T_Auth_Layout_Props) {
  return <Guest_Guard>{children}</Guest_Guard>;
}
