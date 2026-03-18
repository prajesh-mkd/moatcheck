import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer" style={{ textAlign: "center", padding: "40px 24px", color: "var(--text-muted)" }}>
      <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
        © 2026 MoatCheck
        <span style={{ margin: "0 16px" }}>·</span>
        <Link href="/terms" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }} className="footer-link">Terms</Link>
        <span style={{ margin: "0 16px" }}>·</span>
        <Link href="/privacy" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }} className="footer-link">Privacy</Link>
      </p>
    </footer>
  );
}
