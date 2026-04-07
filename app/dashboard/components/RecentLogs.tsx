import { Clock, Trash2 } from "lucide-react";

export default function RecentLogs() {
  const logs = [
    { id: 1, name: "Sallatë Cezar", cal: 350, time: "12:30", emoji: "🥗" },
    { id: 2, name: "Kafe Latte", cal: 120, time: "09:15", emoji: "☕" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-black text-gray-900 text-lg ml-2">Skanimet e Fundit</h3>
      {logs.map((log) => (
        <div key={log.id} className="group bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {log.emoji}
            </div>
            <div>
              <p className="font-bold text-gray-900">{log.name}</p>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={12} /> {log.time}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-emerald-600">+{log.cal} kcal</p>
            <button className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}