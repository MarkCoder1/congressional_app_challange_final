"use client";

import { TableInput } from "@/lib/visualInputs";

function isTableInput(data: unknown): data is TableInput {
  if (!data || typeof data !== "object") return false;
  const maybe = data as TableInput;
  return Array.isArray(maybe.columns) && Array.isArray(maybe.rows);
}

export function TableView({ data }: { data: unknown }) {
  if (!isTableInput(data) || data.columns.length === 0) {
    return <p className="text-sm text-muted-foreground">Table data is invalid.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {data.columns.map((column) => (
              <th key={column} className="text-left p-2 border-b border-border">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr key={idx}>
              {data.columns.map((column, cIdx) => (
                <td key={`${column}-${idx}`} className="p-2 border-b border-border">
                  {String(row[cIdx] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
