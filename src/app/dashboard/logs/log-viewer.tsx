"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";

type Log = {
  id: string;
  date: string;
  content: string;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function wasUpdatedToday(updatedAt: Date) {
  const today = new Date().toISOString().slice(0, 10);
  const updated = new Date(updatedAt).toISOString().slice(0, 10);
  return today === updated;
}

export default function LogViewer({ logs }: { logs: Log[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    logs[0]?.date ?? null
  );
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.content.toLowerCase().includes(q) ||
        log.summary?.toLowerCase().includes(q) ||
        log.date.includes(q)
    );
  }, [logs, search]);

  const selectedLog = logs.find((l) => l.date === selectedDate);

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col">
      {/* Search bar */}
      <div className="border-b border-wood/10 bg-white/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="font-serif text-2xl text-wood hidden sm:block">
            Daily Logs
          </h1>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-wood/15 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/50 text-sm"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden text-wood-light/60 hover:text-forest transition-colors text-sm"
          >
            {sidebarOpen ? "Show content" : "Show dates"}
          </button>
          <span className="text-wood-light/40 text-sm hidden sm:block">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col sm:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar - date list */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } sm:block w-full sm:w-80 sm:min-w-[320px] border-r border-wood/10 bg-white/30 overflow-y-auto sm:max-h-[calc(100vh-220px)]`}
        >
          {filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-wood-light/50 text-sm">
              {search ? "No logs match your search." : "No logs yet."}
            </div>
          ) : (
            <ul>
              {filteredLogs.map((log) => (
                <li key={log.date}>
                  <button
                    onClick={() => {
                      setSelectedDate(log.date);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 border-b border-wood/5 transition-colors ${
                      selectedDate === log.date
                        ? "bg-forest/10 border-l-2 border-l-forest"
                        : "hover:bg-wood/[0.03] border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-serif text-sm ${
                          selectedDate === log.date
                            ? "text-forest-dark"
                            : "text-wood"
                        }`}
                      >
                        {formatDate(log.date)}
                      </span>
                      {wasUpdatedToday(log.updatedAt) && !isToday(log.date) && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest" title="Updated today" />
                      )}
                    </div>
                    {log.summary && (
                      <p className="text-xs text-wood-light/60 mt-1 line-clamp-2 leading-relaxed">
                        {log.summary}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Content area */}
        <main
          className={`${
            !sidebarOpen ? "block" : "hidden"
          } sm:block flex-1 overflow-y-auto sm:max-h-[calc(100vh-220px)]`}
        >
          {selectedLog ? (
            <article className="p-6 sm:p-10 max-w-3xl">
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-wood mb-1">
                  {formatDate(selectedLog.date)}
                </h2>
                {selectedLog.summary && (
                  <p className="text-wood-light/60 text-sm">
                    {selectedLog.summary}
                  </p>
                )}
              </div>
              <div className="prose prose-stone prose-headings:font-serif prose-headings:text-wood prose-p:text-wood-light prose-strong:text-wood prose-a:text-forest prose-a:no-underline hover:prose-a:underline prose-li:text-wood-light prose-sm max-w-none">
                <ReactMarkdown>{selectedLog.content}</ReactMarkdown>
              </div>
            </article>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] text-wood-light/40 text-sm">
              {logs.length > 0
                ? "Select a date to view its log."
                : "No logs yet."}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
