"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface BlockedDevice {
  _id: string;
  fingerprint: string;
  club: string;
  blockedUntil: Date;
  userId?: string;
  username?: string;
  reason?: string;
  createdAt: Date;
}

export default function BlockedDevicesManager() {
  const { data: session } = useSession();
  const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockedDevices = useCallback(async () => {
    if (!session?.user?.club) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/blocked-devices?club=${session.user.club}`
      );
      const data = await response.json();
      if (Array.isArray(data)) setBlockedDevices(data);
    } catch (error) {
      console.error("Failed to load blocked devices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

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
  }, [loadBlockedDevices, session]);

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
              View blocked devices for {session!.user!.club}. If you mistakenly
              blocked a user and want to unblock them, please contact BUCC.
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
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked By Club
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
                        {device.userId || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {device.username || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {formatTimeRemaining(device.blockedUntil)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.club}
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
