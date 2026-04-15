"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { token, signOut } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900">Salary Manager</span>
        <Link href="/employees" className="text-sm text-gray-600 hover:text-gray-900">
          Employees
        </Link>
        <Link href="/insights" className="text-sm text-gray-600 hover:text-gray-900">
          Insights
        </Link>
        <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
          Settings
        </Link>
      </div>
      {token && (
        <button
          onClick={signOut}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
      )}
    </nav>
  );
}
