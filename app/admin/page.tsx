import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayout from "@/components/admin/AdminLayout";
import SystemHealthDashboard from "@/components/admin/SystemHealthDashboard";

// Admin access control
async function checkAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login?redirect=/admin");
  }
  
  // Check if user has admin privileges
  // This could check a user_roles table, admin email list, or other authorization method
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email || "");
  
  if (!isAdmin) {
    redirect("/?error=unauthorized");
  }
  
  return user;
}

export default async function AdminDashboard() {
  const user = await checkAdminAccess();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ink-100">Admin Dashboard</h1>
          <p className="text-ink-400 mt-2">
            Welcome back, {user.email}. Here's your system overview.
          </p>
        </div>
        
        <SystemHealthDashboard />
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 text-center">
            <div className="text-2xl font-bold text-gold-400 mb-1">99.98%</div>
            <div className="text-sm text-ink-400">System Uptime</div>
          </div>
          <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">1,247</div>
            <div className="text-sm text-ink-400">Active Users</div>
          </div>
          <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">127</div>
            <div className="text-sm text-ink-400">Whispers Users</div>
          </div>
          <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">0.02%</div>
            <div className="text-sm text-ink-400">Error Rate</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}