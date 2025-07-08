import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-8 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center items-center">
        {/* Column 1: Logo & Club Info */}
        <div className="flex flex-row items-center space-x-3">
          <img
            src="/bucclogo.svg"
            alt="BRAC University Computer Club Logo"
            className="w-12 h-12"
          />
          <div>
            <div className="font-bold text-lg">
              BRAC University Computer Club
            </div>
            <div className="text-sm">Research and Development Department</div>
            <div className="text-xs mt-2 text-gray-300">
              &copy; {new Date().getFullYear()} BUCC. All rights reserved.
            </div>
          </div>
        </div>

        {/* Column 2: Website Maintenance & Bug Report */}
        <div className="flex flex-col items-center text-center">
          <p className="text-sm mb-4 leading-relaxed">
            This website is maintained by the Web Team of the Research &amp;
            Development Department, BUCC.
          </p>
          <Link
            className="text-blue-400 hover:underline text-sm font-medium"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfnlOcw85JDTRcH8ndxrLiAWnsWWHm9ApihAnitbYzrtAj0OQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report a Bug
          </Link>
        </div>

        {/* Column 3: Developer & Technical Team */}
        <div className="flex flex-col items-center text-center">
          <div className="font-semibold text-lg mb-2">Developer</div>
          <Link
            className="text-blue-400 hover:underline text-sm block mb-2"
            href="https://www.facebook.com/hasibhossain.abir.7/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developer Profile
          </Link>
          <Link
            className="text-blue-400 hover:underline text-sm block"
            href="https://www.bracucc.org/about/executive-body"
            target="_blank"
            rel="noopener noreferrer"
          >
            Technical Team Link
          </Link>
        </div>
      </div>
    </footer>
  );
}
