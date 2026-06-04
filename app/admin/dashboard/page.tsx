import AdminLayout from "@/components/layout/AdminLayout";

import StatsCard from "@/components/dashboard/StatsCard";
import RecentOrders from "@/components/dashboard/RecentOrders";

export default function HomePage() {
  return (
    <AdminLayout>
      {/* TITLE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Sales Overview
          </h1>
        </div>

        <button className="bg-white rounded-2xl px-5 py-3 border border-gray-100">
          April 10, 2026 - May 11, 2026
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatsCard
          title="Total Sales"
          value="2500"
          percentage="+4.9%"
          lastMonth="2345"
        />

        <StatsCard
          title="New Customer"
          value="110"
          percentage="+7.5%"
          lastMonth="89"
        />

        <StatsCard
          title="Return Products"
          value="72"
          percentage="-6.0%"
          lastMonth="60"
        />

        <StatsCard
          title="Total Revenue"
          value="$8,220"
          percentage="+8.1%"
          lastMonth="$6200"
        />
      </div>

      {/* TABLE */}
      <RecentOrders />
    </AdminLayout>
  );
}