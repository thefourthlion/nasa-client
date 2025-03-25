import React, { useState } from "react";

import Link from "next/link";
import Image from "next/image";
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
            <Image
              className="nasa-logo"
              src="/images/nasa-icon.png"
              alt="logo"
              width={45}
              height={45}
            />
          </Link>
        </li>

        <li className="nav-item">
          <Link href="/Apod">APOD</Link>
        </li>

        {/* <li className="nav-item">
          <Link href="/Epic">EPIC</Link>
        </li> */}

        <li className="nav-item">
          <Link href="/Mrp">MRP</Link>
        </li>
        
        <li className="nav-item">
          <Link href="/Search">Search</Link>
        </li>
      </ul>

      <Link href="/" className="pc-none"></Link>

      <Link href="/" className="pc-none">
        <Image
          className="nav-title"
          src="/images/nasa-icon.png"
          alt="logo"
          width={45}
          height={45}
        />
      </Link>
      <div className="burger" onClick={() => setShowLinks(!showLinks)}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </div>
  );
}
