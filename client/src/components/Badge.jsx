// Small coloured label for status and priority. Text is always shown,
// so meaning never depends on colour alone (accessibility).
export default function Badge ({ value }) {
  const cls = String(value).toLowerCase().replace(/\s+/g, '-')
  return <span className={`badge badge-${cls}`}>{value}</span>
}
