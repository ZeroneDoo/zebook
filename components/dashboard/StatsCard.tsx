type Props = {
  title: string;
  value: string;
  percentage: string;
  lastMonth: string;
};

export default function StatsCard({
  title,
  value,
  percentage,
  lastMonth,
}: Props) {
  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex justify-between mb-4">
        <p className="text-gray-500">{title}</p>
      </div>

      <div className="flex items-center gap-3">
        <h2 className="text-4xl font-bold">{value}</h2>

        <span className="bg-green-100 text-green-600 text-sm px-2 py-1 rounded-full">
          {percentage}
        </span>
      </div>

      <p className="text-gray-400 mt-3">
        Last month: {lastMonth}
      </p>
    </div>
  );
}