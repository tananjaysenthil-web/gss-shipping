// Geometry-derived particulars for the 3D model used on this site. These are
// measured from the supplied asset (gss-project-carrier-draco.glb), not a
// published GSS vessel spec sheet.
//
// TODO: confirm with GSS whether this model represents a vessel in their
// managed/chartered rotation or is a representative project-carrier class —
// the source site does not claim vessel ownership, so this page must not
// imply GSS owns or operates this specific hull without that confirmation.

export const vesselParticulars = {
  type: 'Project Carrier (representative class)',
  loa: '138.0 m',
  beam: '21.8 m',
  draft: '7.4 m',
  airDraftCraneTip: '45.1 m',
  // TODO: deadweight, gross tonnage, crane SWL and flag are not measurable
  // from the 3D geometry — request from client.
  deadweight: 'TODO: confirm with GSS',
  craneSWL: 'TODO: confirm with GSS',
  flag: 'TODO: confirm with GSS',
}

export type HotspotId =
  | 'crane-aft'
  | 'crane-fwd'
  | 'blades'
  | 'tower'

export type Hotspot = {
  id: HotspotId
  label: string
  nodeNames: string[]
  // Local-space anchor point (metres, ship coordinate frame) used to place
  // the marker and as the camera look-at target when a hotspot is selected.
  anchor: [number, number, number]
  cameraOffset: [number, number, number]
  spec: { label: string; value: string }[]
}

export const hotspots: Hotspot[] = [
  {
    id: 'crane-aft',
    label: 'Aft Crane',
    nodeNames: [
      'Crane_Aft',
      'Crane_Aft_Pedestal',
      'Crane_Aft_HouseShell',
      'Crane_Aft_MachineryHouse',
      'Crane_Aft_Boom',
      'Crane_Aft_BoomLattice',
      'Crane_Aft_HoistRigging',
    ],
    anchor: [-38, 22, 0],
    cameraOffset: [45, 20, 55],
    spec: [
      { label: 'Position', value: 'Aft working deck' },
      { label: 'SWL', value: 'TODO: confirm with GSS' },
      { label: 'Type', value: 'Pedestal-mounted lattice boom' },
    ],
  },
  {
    id: 'crane-fwd',
    label: 'Forward Crane',
    nodeNames: [
      'Crane_Fwd',
      'Crane_Fwd_Pedestal',
      'Crane_Fwd_HouseShell',
      'Crane_Fwd_MachineryHouse',
      'Crane_Fwd_Boom',
      'Crane_Fwd_BoomLattice',
      'Crane_Fwd_HoistRigging',
    ],
    anchor: [30, 22, 0],
    cameraOffset: [-45, 20, 55],
    spec: [
      { label: 'Position', value: 'Forward working deck' },
      { label: 'SWL', value: 'TODO: confirm with GSS' },
      { label: 'Type', value: 'Pedestal-mounted lattice boom' },
    ],
  },
  {
    id: 'tower',
    label: 'Tower Sections',
    nodeNames: ['TowerSection_1', 'TowerSection_2', 'TowerSection_3', 'TowerSection_4'],
    anchor: [0, 20, 6],
    cameraOffset: [60, 15, 40],
    spec: [
      { label: 'Sections', value: '4, deck cargo' },
      { label: 'Cargo class', value: 'Over-dimensional cargo (ODC)' },
    ],
  },
  {
    id: 'blades',
    label: 'Blade Stack',
    nodeNames: ['Blade_1', 'Blade_2', 'Blade_3', 'Blade_4', 'Blade_5'],
    anchor: [10, 20, -6],
    cameraOffset: [-30, 18, -60],
    spec: [
      { label: 'Count', value: '5, deck cargo' },
      { label: 'Cargo class', value: 'Windmill blades (ODC)' },
    ],
  },
]
