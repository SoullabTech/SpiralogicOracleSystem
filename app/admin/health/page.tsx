import AdminLayout from "@/components/admin/AdminLayout";
import SystemHealthDashboard from "@/components/admin/SystemHealthDashboard";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirect=/admin/health");
  }
  
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email || "");
  
  if (!isAdmin) {
    redirect("/?error=unauthorized");
  }
  
  return user;
}

export default async function HealthPage() {
  await checkAdminAccess();

  return (
    <AdminLayout>
      <SystemHealthDashboard />
    </AdminLayout>
  );
}