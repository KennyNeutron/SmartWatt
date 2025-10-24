import { redirect } from "next/navigation";

export default function RootRedirect() {
  // Always land on /login for now (before auth is wired up).
  redirect("/login");
}
