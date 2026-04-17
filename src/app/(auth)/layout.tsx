export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(0,255,136,0.06),transparent)] pointer-events-none" />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>

      {/* Footer note */}
      <p className="relative z-10 mt-6 text-[11px] text-muted-foreground/30 text-center">
        © 2026 CS2 Intel Pro · Бүх эрх хуулиар хамгаалагдсан
      </p>
    </div>
  );
}
