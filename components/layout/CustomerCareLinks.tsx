"use client";

import { useState } from "react";
import PolicyDialog from "@/components/ui/PolicyDialog";
import { POLICY_LABELS, POLICY_ORDER, type PolicyKey } from "@/lib/policies";

export default function CustomerCareLinks() {
  const [active, setActive] = useState<PolicyKey | null>(null);

  return (
    <>
      <ul className="space-y-2">
        {POLICY_ORDER.map((key) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => setActive(key)}
              className="text-white/65 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block transition-transform duration-200 text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              {POLICY_LABELS[key]}
            </button>
          </li>
        ))}
      </ul>
      <PolicyDialog policyKey={active} onClose={() => setActive(null)} />
    </>
  );
}
