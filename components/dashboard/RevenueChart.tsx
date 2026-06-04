export default function RevenueChart() {
  const bars = [40, 30, 55, 30, 40, 55, 40];

  return (
    <div className="xl:col-span-2 bg-white rounded-3xl p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">
          Revenue Analytics
        </h2>

        <button className="bg-gray-100 px-4 py-2 rounded-xl">
          This Week
        </button>
      </div>

      <div className="flex items-end justify-between h-[280px] gap-4">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3"
          >
            <div
              style={{
                height: `${height * 4}px`,
              }}
              className="w-14 bg-orange-500 rounded-t-full"
            />

            <span className="text-gray-500">
              Day
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}