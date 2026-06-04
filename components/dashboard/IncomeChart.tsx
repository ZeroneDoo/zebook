export default function IncomeChart() {
  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-2xl font-bold mb-2">
        Total Income
      </h2>

      <p className="text-gray-400 mb-8">
        View your income in a certain period
      </p>

      <div className="flex items-end justify-between h-[280px] gap-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="flex gap-1 items-end">
            <div className="w-6 bg-black rounded-t-xl h-24"></div>

            <div className="w-6 bg-orange-500 rounded-t-xl h-40"></div>
          </div>
        ))}
      </div>
    </div>
  );
}