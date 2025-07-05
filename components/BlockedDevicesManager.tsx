"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface BlockedDevice {
  _id: string;
  fingerprint: string;
  club: string;
  blockedUntil: Date;
  blockedBy: string;
  reason: string;
  createdAt: Date;
}

export default function BlockedDevicesManager() {
  const { data: session } = useSession();
  const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null);

  const loadBlockedDevices = async () => {
    if (!session?.user?.club) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/blocked-devices?club=${session!.user!.club}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setBlockedDevices(data);
      }
    } catch (error) {
      console.error("Failed to load blocked devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unblockDevice = async (fingerprint: string) => {
    try {
      setIsUnblocking(fingerprint);
      const response = await fetch("/api/unblock-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint,
          club: session?.user?.club,
        }),
      });

      if (response.ok) {
        // Remove from local state
        setBlockedDevices((prev) =>
          prev.filter((device) => device.fingerprint !== fingerprint)
        );
      } else {
        console.error("Failed to unblock device");
      }
    } catch (error) {
      console.error("Error unblocking device:", error);
    } finally {
      setIsUnblocking(null);
    }
  };

  const formatTimeRemaining = (blockedUntil: Date) => {
    const now = new Date();
    const remaining = new Date(blockedUntil).getTime() - now.getTime();

    if (remaining <= 0) return "Expired";

    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    loadBlockedDevices();

    // Refresh every 30 seconds
    const interval = setInterval(loadBlockedDevices, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return <div>Please log in to access blocked devices.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Blocked Devices</h2>
            <p className="text-gray-600">
              Manage blocked devices for {session.user!.club}
            </p>
          </div>
          <button
            onClick={loadBlockedDevices}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading blocked devices...</p>
          </div>
        ) : blockedDevices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔓</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Blocked Devices
            </h3>
            <p className="text-gray-600">
              There are currently no blocked devices for your club.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blockedDevices.map((device) => (
                  <tr key={device._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {device.fingerprint.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {device.blockedBy}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-900 max-w-xs truncate"
                        title={device.reason}
                      >
                        {device.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {formatTimeRemaining(device.blockedUntil)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(device.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => unblockDevice(device.fingerprint)}
                        disabled={isUnblocking === device.fingerprint}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        {isUnblocking === device.fingerprint ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Unblocking...</span>
                          </>
                        ) : (
                          <>
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
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Unblock</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
