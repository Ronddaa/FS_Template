import Auth_Guard from "@/modules/auth/Auth_Guard/Auth_Guard";
import type { ReactNode } from "react";

type T_Crm_Layout_Props = {
  children: ReactNode;
};

export default function Crm_Layout({ children }: T_Crm_Layout_Props) {
  return <Auth_Guard>{children}</Auth_Guard>;
}
