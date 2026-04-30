import React from "react";

/**
 * Smart pagination:
 * - If totalPages <= 5: shows all numbered buttons (legacy behavior)
 * - If totalPages > 5: shows arrows + condensed window (« ‹ 1 ... 4 [5] 6 ... 20 › »)
 *
 * Props:
 *   currentPage      number  (1-based)
 *   totalPages       number
 *   setPage          function(pageNumber)
 *   activeClass      tailwind classes for active button (default: "bg-blue-500 text-white")
 *   inactiveClass    tailwind classes for inactive buttons (default: "bg-gray-700 text-white")
 */
export default function SmartPagination({
  currentPage,
  totalPages,
  setPage,
  activeClass = "bg-blue-500 text-white",
  inactiveClass = "bg-gray-700 text-white",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const baseBtn = "px-3 py-2 rounded text-sm";
  const arrowBtn = `${baseBtn} ${inactiveClass} disabled:opacity-40 disabled:cursor-not-allowed`;

  // Simple case: show all pages
  if (totalPages <= 5) {
    return (
      <div className="px-4 py-3">
        <nav>
          <ul className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded ${
                    currentPage === p ? activeClass : inactiveClass
                  }`}
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  // Advanced case: arrows + windowed numbers
  const pages = [];
  const window = 1; // pages on each side of current
  const showFirst = currentPage > 1 + window + 1; // need ellipsis after first
  const showLast = currentPage < totalPages - window - 1; // need ellipsis before last

  // Always show 1
  pages.push(1);
  if (showFirst) pages.push("...");

  for (
    let p = Math.max(2, currentPage - window);
    p <= Math.min(totalPages - 1, currentPage + window);
    p++
  ) {
    pages.push(p);
  }

  if (showLast) pages.push("...");
  // Always show last
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="px-4 py-3">
      <nav>
        <ul className="flex justify-center items-center space-x-1 flex-wrap">
          <li>
            <button
              className={arrowBtn}
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              title="Première page"
            >
              «
            </button>
          </li>
          <li>
            <button
              className={arrowBtn}
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              title="Page précédente"
            >
              ‹
            </button>
          </li>

          {pages.map((p, idx) =>
            p === "..." ? (
              <li key={`e-${idx}`} className="px-2 text-gray-400 select-none">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded text-sm ${
                    currentPage === p ? activeClass : inactiveClass
                  }`}
                >
                  {p}
                </button>
              </li>
            )
          )}

          <li>
            <button
              className={arrowBtn}
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              title="Page suivante"
            >
              ›
            </button>
          </li>
          <li>
            <button
              className={arrowBtn}
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
              title="Dernière page"
            >
              »
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
