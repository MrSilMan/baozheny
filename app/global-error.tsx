"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", textAlign: "center", padding: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Critical Error</h2>
          <p style={{ color: "#6b7280" }}>The application encountered a critical error. Please try again.</p>
          <button onClick={reset} style={{ padding: "8px 16px", backgroundColor: "#0f1a3c", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
