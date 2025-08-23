import AdminLayout from "@/components/admin/AdminLayout";
import WhispersAdminPanel from "@/components/admin/WhispersAdminPanel";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirect=/admin/whispers");
  }
  
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email || "");
  
  if (!isAdmin) {
    redirect("/?error=unauthorized");
  }
  
  return user;
}

export default async function WhispersAdminPage() {
  await checkAdminAccess();

  return (
    <AdminLayout>
      <WhispersAdminPanel />
    </AdminLayout>
  );
}