"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/leads");
  }, [router]);
  return (
    <div className="flex min-h-[200px] items-center justify-center text-slate-500">
      Redirecting to Leads…
    </div>
  );
}
