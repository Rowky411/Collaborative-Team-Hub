"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { useAuthStore } from "../../../../../lib/stores/authStore";
import { FormField, TextInput, PrimaryButton } from "../../../../../components/ui/FormField";
import { Modal } from "../../../../../components/Modal";
import { apiError } from "../../../../../lib/apiClient";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const members = useWorkspaceStore((s) => s.members);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const inviteMember = useWorkspaceStore((s) => s.inviteMember);
  const updateMemberRole = useWorkspaceStore((s) => s.updateMemberRole);
  const removeMember = useWorkspaceStore((s) => s.removeMember);
  const currentUser = useAuthStore((s) => s.user);

  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [memberError, setMemberError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      name: workspace?.name || "",
      description: workspace?.description || "",
      accentColor: workspace?.accentColor || "#6366f1",
    },
  });

  const watchedAccentColor = watch("accentColor");

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description || "",
        accentColor: workspace.accentColor,
      });
    }
  }, [workspace, reset]);

  if (!workspace) return null;

  const isAdmin = workspace.role === "ADMIN";

  const onSaveSettings = async (values) => {
    setSaveError(null);
    try {
      await updateWorkspace(workspaceId, {
        name: values.name,
        description: values.description || null,
        accentColor: values.accentColor,
      });
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(apiError(err));
    }
  };

  const onChangeRole = async (userId, role) => {
    setMemberError(null);
    try {
      await updateMemberRole(workspaceId, userId, role);
    } catch (err) {
      setMemberError(apiError(err));
    }
  };

  const onRemove = async (userId) => {
    setMemberError(null);
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(workspaceId, userId);
      if (userId === currentUser?.id) router.replace("/workspaces");
    } catch (err) {
      setMemberError(apiError(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Workspace settings</h1>

      <section className="mt-6 rounded-lg border border-[color:var(--border)] p-5">
        <h2 className="font-medium">Details</h2>
        <form onSubmit={handleSubmit(onSaveSettings)} className="mt-4 flex flex-col gap-4">
          <FormField label="Name" error={errors.name?.message}>
            <TextInput
              register={register}
              name="name"
              {...register("name", {
                required: "Name is required",
                maxLength: { value: 100, message: "Too long" },
              })}
              disabled={!isAdmin}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              {...register("description", {
                maxLength: { value: 500, message: "Too long" },
              })}
              rows={3}
              disabled={!isAdmin}
              className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-60"
            />
          </FormField>

          <FormField label="Accent colour" error={errors.accentColor?.message}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={watchedAccentColor || "#6366f1"}
                onChange={(e) => setValue("accentColor", e.target.value, { shouldDirty: true, shouldValidate: true })}
                disabled={!isAdmin}
                className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] bg-transparent disabled:opacity-60"
              />
              <TextInput
                register={register}
                name="accentColor"
                disabled={!isAdmin}
                {...register("accentColor", {
                  pattern: {
                    value: /^#[0-9a-fA-F]{6}$/,
                    message: "Must be a hex colour",
                  },
                })}
              />
            </div>
          </FormField>

          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

          {isAdmin ? (
            <div className="flex items-center gap-3">
              <PrimaryButton type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </PrimaryButton>
              {savedAt ? <span className="text-xs text-emerald-600">Saved.</span> : null}
            </div>
          ) : (
            <p className="text-xs text-[color:var(--muted)]">
              Only admins can edit workspace details.
            </p>
          )}
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-[color:var(--border)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Members ({members.length})</h2>
          {isAdmin ? (
            <button
              onClick={() => setShowInvite(true)}
              className="rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              + Invite member
            </button>
          ) : null}
        </div>

        {memberError ? (
          <p className="mt-3 text-sm text-red-600">{memberError}</p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase tracking-wide text-[color:var(--muted)]">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = m.userId === currentUser?.id;
                return (
                  <tr key={m.userId} className="border-b border-[color:var(--border)]/60">
                    <td className="py-2 font-medium">{m.name}</td>
                    <td className="py-2 text-[color:var(--muted)]">{m.email}</td>
                    <td className="py-2">
                      {isAdmin && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => onChangeRole(m.userId, e.target.value)}
                          className="rounded-md border border-[color:var(--border)] bg-transparent px-2 py-1 text-xs"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MEMBER">MEMBER</option>
                        </select>
                      ) : (
                        <span>{m.role}</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {isAdmin || isSelf ? (
                        <button
                          onClick={() => onRemove(m.userId)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          {isSelf ? "Leave" : "Remove"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={async (payload) => {
          await inviteMember(workspaceId, payload);
        }}
      />
    </div>
  );
}

function InviteModal({ open, onClose, onInvite }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", role: "MEMBER" } });
  const [serverError, setServerError] = useState(null);

  const close = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await onInvite(values);
      reset();
      onClose();
    } catch (err) {
      setServerError(apiError(err));
    }
  };

  return (
    <Modal open={open} onClose={close} title="Invite member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Email" error={errors.email?.message}>
          <TextInput
            register={register}
            name="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /.+@.+\..+/, message: "Invalid email" },
            })}
            placeholder="teammate@example.com"
          />
        </FormField>
        <FormField label="Role">
          <select
            {...register("role")}
            className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </FormField>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-md px-3 py-2 text-sm hover:bg-[color:var(--border)]/30"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Inviting…" : "Send invite"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
