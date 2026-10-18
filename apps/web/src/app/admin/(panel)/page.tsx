import { redirect } from "next/navigation";

// /admin opens the first section until there is a dashboard (with bookings).
export default function AdminHome() {
  redirect("/admin/servicios");
}
