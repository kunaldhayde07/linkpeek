import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { createClient } from "@/lib/auth/supabase/server";
import { getOrCreateUser } from "@/lib/auth/auth.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user profile exists
  const profile = await getOrCreateUser(
    user.id,
    user.email!,
    user.user_metadata?.name as string | undefined,
    user.user_metadata?.avatar_url as string | undefined
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userName={profile.name} userEmail={profile.email} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
