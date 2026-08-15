import Login_Form from "@/modules/auth/Login_Form/Login_Form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function Login_Page() {
  return <Login_Form />;
}
