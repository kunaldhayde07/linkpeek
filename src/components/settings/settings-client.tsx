"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { updateProfileAction, changePasswordAction, deleteAccountAction } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookmarkletSection } from "./bookmarklet-section";
import { ExportSection } from "./export-section";

interface SettingsClientProps {
  name: string;
  email: string;
  plan: string;
}

export function SettingsClient({ name, email, plan }: SettingsClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold">Profile Information</h3>
        <form
          action={async (formData) => {
            const result = await updateProfileAction(formData);
            if (result.success) toast.success("Profile updated");
            else toast.error(result.error);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={name} className="mt-1.5" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} disabled className="mt-1.5 opacity-60" />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div>
            <Label>Plan</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-flex rounded bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                {plan}
              </span>
            </div>
          </div>
          <Button type="submit" size="sm">Save Changes</Button>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold">Change Password</h3>
        <form
          action={async (formData) => {
            const result = await changePasswordAction(formData);
            if (result.success) toast.success("Password changed successfully");
            else toast.error(result.error);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password" className="mt-1.5" />
          </div>
          <Button type="submit" size="sm">Change Password</Button>
        </form>
      </div>

      {/* Bookmarklet */}
      <BookmarkletSection />

      {/* Export */}
      <ExportSection />

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {isDeleting ? (
          <form
            action={async (formData) => {
              const result = await deleteAccountAction(formData);
              if (result.success) {
                toast.success("Account deleted");
                window.location.href = "/";
              } else {
                toast.error(result.error);
              }
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="confirmEmail">Type your email to confirm: <strong>{email}</strong></Label>
              <Input
                id="confirmEmail"
                name="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={email}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" size="sm" disabled={confirmEmail !== email}>
                Delete My Account
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setIsDeleting(false); setConfirmEmail(""); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="destructive" size="sm" onClick={() => setIsDeleting(true)}>
            Delete Account
          </Button>
        )}
      </div>
    </div>
  );
}
