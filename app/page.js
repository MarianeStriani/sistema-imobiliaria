"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
const router = useRouter();

useEffect(() => {
router.replace("/login");
}, [router]);

return (
<main className="min-vh-100 d-flex align-items-center justify-content-center">
<div className="text-center">
<div
className="spinner-border text-primary"
role="status"
>
<span className="visually-hidden">
Carregando...
</span>
</div>

    <p className="mt-3 text-muted mb-0">
      Redirecionando para o login...
    </p>
  </div>
</main>

);
}