"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BlockedDevicesManager from "../../../components/BlockedDevicesManager";
import Link from "next/link";

export default function BlockedDevicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Only allow access if club is 'bucc'
  const isBUCC = session.user?.club?.toLowerCase() === "bucc";

  if (!isBUCC) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow text-center space-y-4">
          <div className="text-5xl mb-2">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Access Restricted
          </h2>
          <p className="text-gray-600">
            If you mistakenly blocked a user, please contact{" "}
            <span className="font-semibold text-blue-600">BUCC</span> for
            unblocking the device.
            <br />
            This restriction is in place for security reasons.
          </p>
          <Link
            href="/admin"
            className="inline-block px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 hover:border-blue-400 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>{" "}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 mb-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold">Blocked Devices Management</h1>
          <p className="text-gray-600">{session.user!.club} Admin Panel</p>
        </div>
        <div className="text-sm text-gray-500">
          Welcome, {session.user!.email}
        </div>
      </div>

      <BlockedDevicesManager />
    </div>
  );
}
