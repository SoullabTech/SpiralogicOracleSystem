import AdminLayout from "@/components/admin/AdminLayout";
import FeatureFlagPanel from "@/components/admin/FeatureFlagPanel";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirect=/admin/features");
  }
  
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email || "");
  
  if (!isAdmin) {
    redirect("/?error=unauthorized");
  }
  
  return user;
}

export default async function FeaturesPage() {
  await checkAdminAccess();

  return (
    <AdminLayout>
      <FeatureFlagPanel />
    </AdminLayout>
  );
}