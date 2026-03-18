"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <span className="nav-icon">🛡️</span>
        MoatCheck
      </Link>

      <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
      </div>

      <div className={`nav-actions ${isMenuOpen ? "nav-actions-mobile-open" : ""}`}>
        <div className="nav-links">
          <Link href="/features" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="/agents" onClick={() => setIsMenuOpen(false)}>Agents</Link>
        </div>
        <a href="mailto:moatcheck@aarshinnovations.com" className="btn-secondary" id="support-btn" onClick={() => setIsMenuOpen(false)}>
          Support
        </a>
      </div>
    </nav>
  );
}
