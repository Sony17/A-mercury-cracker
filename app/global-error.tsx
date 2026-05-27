"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, background: "#000814", color: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem", color: "#FFD166" }}>Something went wrong</h1>
          <p style={{ opacity: 0.8, marginBottom: "1.5rem", maxWidth: 480 }}>
            An unexpected error occurred. You can try again, or return to the home page.
          </p>
          {error?.digest ? (
            <p style={{ opacity: 0.5, fontSize: "0.75rem", marginBottom: "1.5rem" }}>Ref: {error.digest}</p>
          ) : null}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => unstable_retry()}
              style={{ background: "#FFD166", color: "#001D3D", border: 0, padding: "0.6rem 1.1rem", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ background: "transparent", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)", padding: "0.6rem 1.1rem", borderRadius: 8, textDecoration: "none" }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
