import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    // Replace with actual role logic
    const isAdmin = session?.user?.email?.endsWith("@yourdomain.com");

    if (!session || !isAdmin) {
      router.push("/"); // redirect non-admins
    }
  }, [session, router]);

  return <>{children}</>;
}
