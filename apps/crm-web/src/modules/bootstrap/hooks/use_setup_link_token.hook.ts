// Path: apps/crm-web/src/modules/bootstrap/hooks/use_setup_link_token.hook.ts

"use client";

import { useSyncExternalStore } from "react";

function subscribe_to_hash(on_change: () => void) {
  window.addEventListener("hashchange", on_change);
  return () => window.removeEventListener("hashchange", on_change);
}

function read_link_token(): string {
  const match = /^#token=([A-Za-z0-9_-]{43})$/.exec(window.location.hash);
  return match?.[1] ?? "";
}

function get_server_token(): null {
  return null;
}

export function useSetup_link_token(): string | null {
  return useSyncExternalStore(
    subscribe_to_hash,
    read_link_token,
    get_server_token,
  );
}
