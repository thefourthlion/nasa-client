import React, { useState } from "react";

import Link from "next/link";

export default function Navigation() {
  const [copied, setCopied] = useState(false);

  const [mint, setMint] = useState([]);
  const [showLinks, setShowLinks] = useState(false);

  const [showMint, setShowMint] = useState(false);

  return (
    <div className="Navigation" id="Navigation">
      <ul
        className="nav nav-links"
        id={showLinks ? "nav-active" : "nav-hidden"}
      >
        <li>
          <Link href="/" className="phone-none">
            NASA
          </Link>
        </li>

        <li className="nav-item">
          <Link href="/Apod">APOD</Link>
        </li>
        <li className="nav-item">
          <Link href="/Epic">EPIC</Link>
        </li>

        <li className="nav-item">
          <Link href="/Mrp">MRP</Link>
        </li>
      </ul>

      <Link href="/" className="pc-none"></Link>

      <Link href="/" className="pc-none">
        <h1 className="nav-title">NASA</h1>
      </Link>
      <div className="burger" onClick={() => setShowLinks(!showLinks)}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </div>
  );
}
