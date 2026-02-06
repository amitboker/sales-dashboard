export default function DataTable({ columns, rows }) {
  return (
    <div className="card table-card">
      <div className="table-header">
        <div className="table-title">טבלת מוקדים</div>
        <span className="muted">8 רשומות</span>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

