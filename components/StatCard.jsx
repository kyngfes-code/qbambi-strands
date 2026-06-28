export default function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
  );
}
