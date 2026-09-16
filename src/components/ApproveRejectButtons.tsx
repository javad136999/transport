"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ApproveRejectButtons({
  table,
  id,
  approvedValue = "approved",
  rejectedValue = "rejected",
  onDone,
}: {
  table: string;
  id: string;
  approvedValue?: string;
  rejectedValue?: string;
  onDone?: () => void;
}) {
  const supabase = createClient();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function act(status: string, key: "approve" | "reject") {
    setBusy(key);
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    setBusy(null);
    if (!error) onDone?.();
    else alert("عملیات ناموفق بود: " + error.message);
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-xs px-3 py-1.5 rounded bg-status-ok/15 text-status-ok hover:bg-status-ok/25 disabled:opacity-50"
        disabled={busy !== null}
        onClick={() => act(approvedValue, "approve")}
      >
        {busy === "approve" ? "..." : "تأیید"}
      </button>
      <button
        className="text-xs px-3 py-1.5 rounded bg-status-alert/15 text-status-alert hover:bg-status-alert/25 disabled:opacity-50"
        disabled={busy !== null}
        onClick={() => act(rejectedValue, "reject")}
      >
        {busy === "reject" ? "..." : "رد"}
      </button>
    </div>
  );
}
