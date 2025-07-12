import decaPIs from './deca-pis.json';

// DECA Event configurations
export interface DecaEvent {
  name: string;
  code: string;
  cluster: string;
  type: 'individual' | 'team';
  instructionalAreas: string[];
  description: string;
}

// Team Decision Making Events (require 7 PIs instead of 5)
export const TEAM_EVENTS = [
  'Business Solutions Project (PMBS)',
  'Buying and Merchandising Team Decision Making (BTDM)',
  'Entrepreneurship Team Decision Making (ETDM)',
  'Financial Services Team Decision Making (FTDM)',
  'Hospitality Services Team Decision Making (HTDM)',
  'International Business Team Decision Making (IBTDM)',
  'Marketing Management Team Decision Making (MTDM)',
  'Sports and Entertainment Marketing Team Decision Making (STDM)',
  'Travel and Tourism Team Decision Making (TTDM)'
];

// Full DECA event list with clusters and instructional areas
export const DECA_EVENTS: DecaEvent[] = [
  // Entrepreneurship Career Cluster
  {
    name: 'Entrepreneurship Career Cluster',
    code: 'ECC',
    cluster: 'Entrepreneurship',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Entrepreneurship', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Focuses on entrepreneurship and small business management'
  },
  // Business Management & Administration
  {
    name: 'Business Solutions Project (PMBS)',
    code: 'PMBS',
    cluster: 'Business Management & Administration',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team-based project focusing on business solutions and management'
  },
  // Finance Career Cluster
  {
    name: 'Accounting Applications (FTDM)',
    code: 'FTDM',
    cluster: 'Finance',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on accounting applications'
  },
  {
    name: 'Financial Services Team Decision Making (FTDM)',
    code: 'FTDM',
    cluster: 'Finance',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making event for financial services'
  },
  // Hospitality & Tourism
  {
    name: 'Hospitality Services Team Decision Making (HTDM)',
    code: 'HTDM',
    cluster: 'Hospitality & Tourism',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for hospitality and tourism services'
  },
  {
    name: 'Hotel and Lodging Management Series (HLM)',
    code: 'HLM',
    cluster: 'Hospitality & Tourism',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on hotel and lodging management'
  },
  {
    name: 'Travel and Tourism Team Decision Making (TTDM)',
    code: 'TTDM',
    cluster: 'Hospitality & Tourism',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for travel and tourism industry'
  },
  // Marketing Career Cluster
  {
    name: 'Marketing Management Team Decision Making (MTDM)',
    code: 'MTDM',
    cluster: 'Marketing',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for marketing management'
  },
  {
    name: 'Sports and Entertainment Marketing Team Decision Making (STDM)',
    code: 'STDM',
    cluster: 'Marketing',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for sports and entertainment marketing'
  }
];

// Get event by name
export function getEventByName(eventName: string): DecaEvent | undefined {
  return DECA_EVENTS.find(event => event.name === eventName);
}

// Get cluster name from event
export function getClusterFromEvent(eventName: string): string {
  const event = getEventByName(eventName);
  return event ? event.cluster : 'Business Management & Administration';
}

// Check if event is team-based
export function isTeamEvent(eventName: string): boolean {
  return TEAM_EVENTS.includes(eventName);
}

// Get all PIs for a specific instructional area within a cluster
export function getPIsForInstructionalArea(cluster: string, instructionalArea: string): string[] {
  const clusterData = decaPIs[cluster as keyof typeof decaPIs];
  if (!clusterData) {
    console.warn(`Cluster "${cluster}" not found in DECA PIs`);
    return [];
  }
  
  // Try to find exact match first
  const exactMatch = clusterData[instructionalArea as keyof typeof clusterData];
  if (exactMatch) {
    return exactMatch as string[];
  }
  
  // Try to find partial match (e.g., "BL" for "Business Law")
  const shortCode = instructionalArea.split(' ').map(word => word.charAt(0)).join('');
  const partialMatch = Object.keys(clusterData).find(key => 
    key.toLowerCase().includes(shortCode.toLowerCase()) || 
    key.toLowerCase().includes(instructionalArea.toLowerCase())
  );
  
  if (partialMatch) {
    return clusterData[partialMatch as keyof typeof clusterData] as string[];
  }
  
  console.warn(`Instructional area "${instructionalArea}" not found in cluster "${cluster}"`);
  return [];
}

// Interface for PI with instructional area information
export interface PIWithArea {
  pi: string;
  instructionalArea: string;
}

// Get random PIs for roleplay based on selected event and optional instructional area
export function getRandomPIsForRoleplay(eventName: string, selectedInstructionalArea?: string): PIWithArea[] {
  console.log(`PI Generation Debug: Event "${eventName}", Selected Area: "${selectedInstructionalArea}"`);
  
  const event = getEventByName(eventName);
  if (!event) {
    console.warn(`Event "${eventName}" not found`);
    return [];
  }
  
  const cluster = event.cluster;
  const numPIs = isTeamEvent(eventName) ? 7 : 5;
  console.log(`PI Generation Debug: Event found, Cluster: "${cluster}", NumPIs: ${numPIs}, IsTeam: ${isTeamEvent(eventName)}`);
  
  // Map cluster names to JSON cluster names
  const clusterMappings: { [key: string]: string } = {
    'Entrepreneurship': 'Entrepreneurship Career Cluster',
    'Business Administration Core': 'Business Administration Core Career Cluster',
    'Finance': 'Finance Career Cluster',
    'Hospitality & Tourism': 'Hospitality Career Cluster',
    'Marketing': 'Marketing Career Cluster',
    'Business Management & Administration': 'Business Management and Administration Career Cluster'
  };
  
  const jsonClusterName = clusterMappings[cluster] || cluster;
  console.log(`PI Generation Debug: Mapped cluster "${cluster}" to JSON cluster "${jsonClusterName}"`);
  
  const clusterData = decaPIs[jsonClusterName as keyof typeof decaPIs];
  
  if (!clusterData) {
    console.warn(`Cluster "${jsonClusterName}" not found in PI data`);
    console.log(`Available clusters:`, Object.keys(decaPIs));
    return [];
  }
  
  // Get instructional area to use
  let instructionalAreaToUse = selectedInstructionalArea;
  if (!instructionalAreaToUse) {
    // Get available instructional areas from the JSON (they include abbreviations)
    const availableAreas = Object.keys(clusterData);
    instructionalAreaToUse = availableAreas[Math.floor(Math.random() * availableAreas.length)];
    console.log(`PI Generation Debug: No specific area selected, using random area: "${instructionalAreaToUse}"`);
  }
  
  console.log(`PI Generation Debug: Available instructional areas:`, Object.keys(clusterData));
  
  // Get all PIs for this instructional area
  const allPIs = clusterData[instructionalAreaToUse as keyof typeof clusterData] as string[];
  
  if (!allPIs || allPIs.length === 0) {
    console.warn(`No PIs found for instructional area "${instructionalAreaToUse}" in cluster "${jsonClusterName}"`);
    return [];
  }
  
  console.log(`PI Generation Debug: Found ${allPIs.length} PIs for area "${instructionalAreaToUse}"`);
  
  // Randomly select the required number of PIs
  const selectedPIs: PIWithArea[] = [];
  const availablePIs = [...allPIs]; // Create a copy to avoid modifying original
  
  for (let i = 0; i < Math.min(numPIs, availablePIs.length); i++) {
    const randomIndex = Math.floor(Math.random() * availablePIs.length);
    selectedPIs.push({
      pi: availablePIs.splice(randomIndex, 1)[0],
      instructionalArea: instructionalAreaToUse
    });
  }
  
  console.log(`PI Generation Debug: Selected ${selectedPIs.length} PIs:`, selectedPIs);
  return selectedPIs;
}

// Get available instructional areas for a cluster (from JSON)
export function getInstructionalAreasForCluster(cluster: string): string[] {
  const clusterMappings: { [key: string]: string } = {
    'Entrepreneurship': 'Entrepreneurship Career Cluster',
    'Business Administration Core': 'Business Administration Core Career Cluster',
    'Finance': 'Finance Career Cluster',
    'Hospitality & Tourism': 'Hospitality Career Cluster',
    'Marketing': 'Marketing Career Cluster',
    'Business Management & Administration': 'Business Management and Administration Career Cluster'
  };
  
  const jsonClusterName = clusterMappings[cluster] || cluster;
  const clusterData = decaPIs[jsonClusterName as keyof typeof decaPIs];
  return clusterData ? Object.keys(clusterData) : [];
}

// Get all available clusters
export function getAvailableClusters(): string[] {
  return Object.keys(decaPIs);
}



// Helper function to format PI for display
export function formatPI(pi: string): string {
  return pi.replace(/^[A-Z]{2}:\d{3}\s*–\s*/, '').trim();
}

// Get PI code from full PI string
export function getPICode(pi: string): string {
  const match = pi.match(/^([A-Z]{2}:\d{3})/);
  return match ? match[1] : '';
}

// Search PIs by keyword
export function searchPIs(keyword: string, cluster?: string): Array<{ pi: string; cluster: string; area: string }> {
  const results: Array<{ pi: string; cluster: string; area: string }> = [];
  const searchTerm = keyword.toLowerCase();
  
  const clustersToSearch = cluster ? [cluster] : getAvailableClusters();
  
  clustersToSearch.forEach(clusterName => {
    const clusterData = decaPIs[clusterName as keyof typeof decaPIs];
    if (clusterData) {
      Object.entries(clusterData).forEach(([areaName, pis]) => {
        (pis as string[]).forEach(pi => {
          if (pi.toLowerCase().includes(searchTerm)) {
            results.push({
              pi,
              cluster: clusterName,
              area: areaName
            });
          }
        });
      });
    }
  });
  
  return results;
}