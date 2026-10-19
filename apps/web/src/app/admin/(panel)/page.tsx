import { redirect } from "next/navigation";

// /admin opens the agenda.
export default function AdminHome() {
  redirect("/admin/reservas");
}
