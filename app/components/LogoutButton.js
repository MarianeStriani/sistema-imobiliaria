"use client";

import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btn-outline-danger btn-sm px-3 py-2 ms-3"
      onClick={sair}
    >
      Sair
    </button>
  );
}