// Sourced from http://gss-shipping.com (fetched 2026-08-29). Quotes are paraphrased
// only where needed for layout; facts are not altered. TODOs mark anything not
// published on the source site — fill in with client-supplied copy, never guess.

export const company = {
  name: 'Global Sea Service',
  shortName: 'GSS',
  tagline: 'Lifting Cargo with Spirit',
  founded: 2003,
  positioning:
    "Established in 2003, GSS focuses on the niche area of Project Cargo Operations, involving heavy lifts and ODC's (Over Dimensional Cargo).",
  aboutLong:
    'Our skilled team of Master Mariners provides expert Port Captain services along with Survey and Inspection services in the Asia-Pacific Region, the Middle East Region, and North and East Africa. Strong connections with leading project cargo liners, established over years of trusted service, have made Global Sea Service one of the most sought-after service providers for Port Operations for project cargo.',
  network:
    'With an extended professional network of local agents, stevedores, transporters, ship chandlers, workshops and other service providers in over 58 ports, GSS offers swift, safe and efficient turn-around of project cargo operations.',
  portCount: 58,
  regions: ['Asia-Pacific', 'Middle East', 'North & East Africa'],
  // Cities shown on the original site's world-clock widget — presented there
  // alongside "Time", not explicitly labelled as office addresses.
  networkCities: ['Dubai', 'Denmark', 'Germany', 'India', 'Jordan', 'Singapore'],
}

export const office = {
  name: 'Global Sea Service',
  addressLines: ['First Floor, 12/2, SivaPrakasam Road', 'T Nagar, Chennai 600017', 'Tamil Nadu, India'],
  tel: '+91 44 45590017',
  mobile: '+91 97907 10011',
  email: 'portcaptain@gss-shipping.com',
}

export type ServiceSection = {
  id: string
  title: string
  summary: string
  items: string[]
}

export const services: ServiceSection[] = [
  {
    id: 'port-captain',
    title: 'Port Captain Services',
    summary:
      "Project cargo is our domain of expertise, and our Port Captains get their focus from heavy lifts. We provide complete Port Captain services from pre-berthing until the vessel sails, with each job assessed, prepared and planned in real time.",
    items: [
      'Pre-berthing meeting with agent, stevedore, transporter and workshop',
      'Cargo inspection in case of loading operations',
      'Stowage plan preparation',
      'Operation plan: cargo loading/discharge sequence, workshop & ship chandler, special cranes and spreaders, and equipment preparation',
      'On-board meeting with Master/Chief upon berthing',
      '24/7 monitoring of operations and constant communication with shipper, client, vessel operator and agent',
      'Complete operation: secure lashing for loading, safe transport for discharging, handover meeting with Master/Chief',
      'Comprehensive post-operation reporting: statement of facts, final stowage plan, lashing-arrangement diagrams and photos',
    ],
  },
  {
    id: 'survey-inspection',
    title: 'Survey & Inspection Services',
    summary:
      "Technical supervision assisting in locating and evaluating appropriate sea-transport modality, and ensuring clients use the appropriate vessel for the task.",
    items: [
      'Technical supervision: vessel stability and cargo handling during port operations',
      'Conditional survey: vessel, cargo and seaworthiness condition; certification and equipment compliance',
      'On & off hire: conditional surveys in connection with delivery/redelivery',
      'Bunker survey: as independent surveyor or on behalf of a client',
      'Draft survey: as independent surveyor or on behalf of a client',
      'Damage survey: representing the client on claims and damage reduction to cargo or vessel',
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics Services',
    summary: 'Technical expertise and consultancy on logistics services, grouped under three categories.',
    items: [
      'General logistics services: loading and unloading, storage, stripping and stuffing, consolidation, and distribution',
      'General value-added services: equipment renting and leasing, equipment maintenance and cleaning facilities',
      'Value-added logistics: repackaging, customising, assembly and repair',
    ],
  },
]

export type ProjectRecord = {
  date: string
  country: string
  operation: string
  port: string
}

// Verbatim entries from the "Completed Projects" page of the source site.
export const completedProjects: ProjectRecord[] = [
  { date: '2015-05-14', country: 'India', operation: 'Loading: Steel Coils', port: 'Hazira' },
  { date: '2015-04-16', country: 'India', operation: 'Loading: General Cargo', port: 'Chennai' },
  { date: '2015-04-14', country: 'India', operation: 'Loading: Windmill Blades', port: 'Tuticorin' },
]

// TODO: source site lists no named certifications or memberships — request
// from client (e.g. P&I club, class society affiliations, ISO certifications)
// before publishing any claim here.
export const certifications: string[] = []

// TODO: source site names no individual team members — request bios/photos
// from client rather than inventing names or headshots.
export const team: { name: string; role: string }[] = []
