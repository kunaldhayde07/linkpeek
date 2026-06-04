import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "@/components/settings/settings-client";
import { createClient } from "@/lib/auth/supabase/server";
import { getUserById } from "@/lib/auth/auth.service";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getUserById(user.id);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <SettingsClient
        name={profile?.name ?? ""}
        email={profile?.email ?? user.email ?? ""}
        plan={profile?.plan ?? "free"}
      />
    </div>
  );
}
