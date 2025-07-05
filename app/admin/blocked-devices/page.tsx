"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BlockedDevicesManager from "../../../components/BlockedDevicesManager";

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
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
