import Register_Form from "@/modules/auth/Register_Form/Register_Form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
};

export default function Register_Page() {
  return <Register_Form />;
}
