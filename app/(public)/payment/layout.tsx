import { redirect } from "next/navigation";

import { DASHBOARD_HOME } from "@/lib/constants";
import { requireUser } from "@/lib/session";

/**
 * Payment success / cancel pages are for signed-in customers (technicians land
 * here too after buying the Pro plan). Admins have nothing to pay for.
 */
export default async function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "admin") {
    redirect(DASHBOARD_HOME.admin);
  }
  return children;
}
