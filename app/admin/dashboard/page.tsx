"use client";

import { useEffect, useState } from "react";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
  size: "small" | "medium" | "large";
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  description,
  route,
  size,
}) => {
  const router = useRouter();

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 row-span-2 md:col-span-2 md:row-span-1",
    large: "col-span-2 row-span-2",
  };

  const handleCardClick = () => {
    console.log(`Navigating to: ${route}`);
    router.push(route);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        ${sizeClasses[size]} 
        bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
        cursor-pointer border border-gray-200 hover:border-blue-300
        p-6 flex flex-col justify-between group hover:scale-105
      `}
    >
      <div className="flex items-start justify-between">
        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
          Click to access →
        </span>
      </div>
    </div>
  );
};

export default function AdminDashBoard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/admin/login");
    }
  }, [router, session, status]);

  const [clubName, setClubName] = useState<string | undefined>(
    session?.user?.club
  );
  const [userName, setUserName] = useState<string>(session?.user?.email ?? "");

  useEffect(() => {
    if (session?.user?.club) {
      setClubName(session.user.club);
      setUserName(session.user.club);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const dashboardCards: DashboardCardProps[] = [
    {
      title: "Page Builder",
      icon: <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />,
      description:
        "Create and customize pages for your club website with our intuitive page builder.",
      route: "/admin/page-builder",
      size: "large",
    },
    {
      title: "Chat System",
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />,
      description: "Manage club communications and member interactions.",
      route: "/admin/chat-system",
      size: "medium",
    },
    {
      title: "Update Password",
      icon: <KeyIcon className="w-8 h-8 text-blue-600" />,
      description: "Change your account password and security settings.",
      route: "/admin/update-password",
      size: "small",
    },
    {
      title: "Blocked Users",
      icon: <UserMinusIcon className="w-8 h-8 text-blue-600" />,
      description: "View and manage blocked or restricted club members.",
      route: "/admin/blocked-devices",
      size: "small",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Club name */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to <span className="text-blue-600">{clubName}</span>
              </h1>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserIcon className="w-5 h-5" />
                <span className="font-medium">{userName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your club settings and content from here.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              icon={card.icon}
              description={card.description}
              route={card.route}
              size={card.size}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
