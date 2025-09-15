// app/components/ui/use-toast.ts
type Variant = "default" | "destructive";
type ToastOptions = {
  title?: string;
  description?: string;
  variant?: Variant;
};

export function toast(opts: ToastOptions = {}) {
  if (typeof window !== "undefined") {
    const msg = [opts.title, opts.description]
      .filter(Boolean)
      .join("\n");
    // Fallback minimalista
    window.setTimeout(() => window.alert(msg || "Hecho"), 0);
  } else {
    // SSR fallback
    // eslint-disable-next-line no-console
    console.log(`[toast] ${opts.title ?? ""} ${opts.description ?? ""}`);
  }
}

export function useToast() {
  return { toast };
}
