import { vesselParticulars } from '../content/vessel'

type Row = { label: string; value: string }

const FULL_ROWS: Row[] = [
  { label: 'Type', value: vesselParticulars.type },
  { label: 'LOA', value: vesselParticulars.loa },
  { label: 'Beam', value: vesselParticulars.beam },
  { label: 'Draft', value: vesselParticulars.draft },
  { label: 'Air draft (crane tip)', value: vesselParticulars.airDraftCraneTip },
  { label: 'Deadweight', value: vesselParticulars.deadweight },
  { label: 'Crane SWL', value: vesselParticulars.craneSWL },
  { label: 'Flag', value: vesselParticulars.flag },
]

const COMPACT_ROWS: Row[] = [
  { label: 'LOA', value: vesselParticulars.loa },
  { label: 'Beam', value: vesselParticulars.beam },
  { label: 'Draft', value: vesselParticulars.draft },
  { label: 'Air draft', value: vesselParticulars.airDraftCraneTip },
]

export function VesselParticulars({ compact = false, caption }: { compact?: boolean; caption?: string }) {
  const rows = compact ? COMPACT_ROWS : FULL_ROWS

  return (
    <figure className="m-0">
      <table className="particulars-table">
        {caption ? (
          <caption className="mb-2 text-left font-mono text-xs uppercase tracking-wide2 text-muted">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr>
            {rows.map((r) => (
              <th key={r.label} scope="col">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {rows.map((r) => (
              <td key={r.label}>{r.value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </figure>
  )
}
