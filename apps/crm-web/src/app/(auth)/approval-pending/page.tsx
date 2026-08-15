import Approval_Pending from "@/modules/auth/Approval_Pending/Approval_Pending";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Awaiting approval",
};

export default function Approval_Pending_Page() {
  return <Approval_Pending />;
}
