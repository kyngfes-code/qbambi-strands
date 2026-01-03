export default function OfflineNotice() {
  return (
    <div className="border border-red-300 bg-red-50 text-red-700 p-4 rounded-md mt-4">
      <h2 className="font-semibold text-lg">No internet</h2>

      <p className="mt-1 text-sm">You’re currently offline. Try:</p>

      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Checking the network cables, modem, and router</li>
        <li>Reconnecting to Wi-Fi</li>
        <li>Running Windows Network Diagnostics</li>
      </ul>

      <p className="mt-2 text-xs text-gray-600">
        DNS_PROBE_FINISHED_NO_INTERNET
      </p>
    </div>
  );
}
