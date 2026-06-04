export default function RecentOrders() {
  return (
    <div className="bg-white rounded-3xl p-6 overflow-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          Recent Orders
        </h2>

        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-100 rounded-2xl px-4 py-3 outline-none"
        />
      </div>

      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th className="pb-4">Order ID</th>
            <th className="pb-4">Date</th>
            <th className="pb-4">Customer</th>
            <th className="pb-4">Status</th>
            <th className="pb-4">Total</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="py-5">#878909</td>
            <td>2 Dec 2026</td>
            <td>Oliver John Brown</td>

            <td>
              <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm">
                Pending
              </span>
            </td>

            <td>$789</td>
          </tr>

          <tr>
            <td className="py-5">#878910</td>
            <td>1 Dec 2026</td>
            <td>Noah James Smith</td>

            <td>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                Completed
              </span>
            </td>

            <td>$967</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}