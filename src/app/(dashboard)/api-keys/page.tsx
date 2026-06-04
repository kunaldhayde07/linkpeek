import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ApiKeysClient } from "@/components/api-keys/api-keys-client";
import { createClient } from "@/lib/auth/supabase/server";
import { listApiKeys } from "@/lib/auth/api-key.service";

export const metadata: Metadata = {
  title: "API Keys",
};

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const keys = await listApiKeys(user.id);

  return (
    <div>
      <PageHeader title="API Keys" description="Manage your API keys for authentication" />

      <ApiKeysClient initialKeys={keys} />

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="text-muted-foreground">
          <strong className="text-foreground">API keys are shown only once at creation.</strong>{" "}
          Store them securely. You can have up to 5 active keys.
        </div>
      </div>
    </div>
  );
}
