"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ToastDisplay() {
  const { toast } = useStore();

  const Icon =
    toast?.type === "error" || toast?.type === "warn"
      ? AlertCircle
      : toast?.type === "info"
      ? Info
      : CheckCircle2;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.msg}
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, type: "spring" }}
          className={cn(
            "fixed top-20 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl max-w-xs text-sm font-semibold",
            toast.type === "error" ? "bg-destructive text-white" :
            toast.type === "warn" ? "bg-amber-500 text-white" :
            "bg-green-600 text-white"
          )}
        >
          <Icon size={16} className="flex-shrink-0" />
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
