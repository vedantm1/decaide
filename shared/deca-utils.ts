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
  'Travel and Tourism Team Decision Making (TTDM)',
  'Business Management and Administration Team Decision Making (BTDM)'
];

// Full DECA event list with clusters and instructional areas
export const DECA_EVENTS: DecaEvent[] = [
  // Entrepreneurship Career Cluster
  {
    name: 'Entrepreneurship Team Decision Making (ETDM)',
    code: 'ETDM',
    cluster: 'Entrepreneurship',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Entrepreneurship', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for entrepreneurship ventures'
  },
  {
    name: 'Independent Business Plan (IBP)',
    code: 'IBP',
    cluster: 'Entrepreneurship',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Entrepreneurship', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual business plan development and presentation'
  },
  {
    name: 'Entrepreneurship Series (ENT)',
    code: 'ENT',
    cluster: 'Entrepreneurship',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Entrepreneurship', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual series focusing on entrepreneurship skills and strategies'
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
  {
    name: 'Business Management and Administration Team Decision Making (BTDM)',
    code: 'BTDM',
    cluster: 'Business Management & Administration',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for business management and administration'
  },
  {
    name: 'Human Resources Management Series (HRM)',
    code: 'HRM',
    cluster: 'Business Management & Administration',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on human resources management'
  },
  
  // Finance Career Cluster
  {
    name: 'Accounting Applications Series (ACT)',
    code: 'ACT',
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
  {
    name: 'Personal Financial Literacy Event (PFL)',
    code: 'PFL',
    cluster: 'Finance',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on personal financial literacy'
  },
  {
    name: 'Banking and Financial Services Series (BFIN)',
    code: 'BFIN',
    cluster: 'Finance',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on banking and financial services'
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
  {
    name: 'Restaurant and Food Service Management Series (RFSM)',
    code: 'RFSM',
    cluster: 'Hospitality & Tourism',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on restaurant and food service management'
  },
  {
    name: 'Quick Serve Restaurant Management Series (QSRM)',
    code: 'QSRM',
    cluster: 'Hospitality & Tourism',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on quick serve restaurant management'
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
  },
  {
    name: 'Marketing Communications Series (MCS)',
    code: 'MCS',
    cluster: 'Marketing',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on marketing communications'
  },
  {
    name: 'Professional Selling and Consulting (PSC)',
    code: 'PSC',
    cluster: 'Marketing',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual event focusing on professional selling and consulting'
  },
  {
    name: 'Buying and Merchandising Team Decision Making (BTDM)',
    code: 'BTDM',
    cluster: 'Marketing',
    type: 'team',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Team decision making for buying and merchandising'
  },
  {
    name: 'Creative Marketing Project (CMP)',
    code: 'CMP',
    cluster: 'Marketing',
    type: 'individual',
    instructionalAreas: ['Business Law', 'Communication Skills', 'Customer Relations', 'Economics', 'Emotional Intelligence', 'Financial Analysis', 'Human Resources Management', 'Information Management', 'Marketing', 'Operations', 'Professional Development', 'Strategic Management'],
    description: 'Individual creative marketing project and presentation'
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
  const event = getEventByName(eventName);
  return event ? event.type === 'team' : false;
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
  const event = getEventByName(eventName);
  if (!event) {
    console.warn(`Event "${eventName}" not found`);
    return [];
  }
  
  const cluster = event.cluster;
  const isTeam = isTeamEvent(eventName);
  const numPIs = isTeam ? 7 : 5;
  
  console.log(`Event: ${eventName}, Type: ${event.type}, Is Team: ${isTeam}, Target PIs: ${numPIs}`);
  
  // Map cluster names to JSON cluster names
  const clusterMappings: { [key: string]: string } = {
    'Entrepreneurship': 'Entrepreneurship Career Cluster',
    'Business Administration Core': 'Business Administration Core Career Cluster',
    'Finance': 'Finance Career Cluster',
    'Hospitality & Tourism': 'Hospitality Career Cluster',
    'Marketing': 'Marketing Career Cluster',
    'Business Management & Administration': 'Business Management & Administration Career Cluster'
  };
  
  const jsonClusterName = clusterMappings[cluster] || cluster;
  const clusterData = decaPIs[jsonClusterName as keyof typeof decaPIs];
  
  if (!clusterData) {
    console.warn(`Cluster "${jsonClusterName}" not found in PI data`);
    return [];
  }
  
  // Collect all PIs from all instructional areas in the cluster
  const allPIsWithAreas: PIWithArea[] = [];
  const availableAreas = Object.keys(clusterData);
  
  // If a specific instructional area is selected, try to get PIs from that area first
  if (selectedInstructionalArea) {
    const specificAreaPIs = clusterData[selectedInstructionalArea as keyof typeof clusterData] as string[];
    if (specificAreaPIs && specificAreaPIs.length > 0) {
      specificAreaPIs.forEach(pi => {
        allPIsWithAreas.push({
          pi,
          instructionalArea: selectedInstructionalArea
        });
      });
    }
  }
  
  // If we don't have enough PIs yet, add from other areas
  if (allPIsWithAreas.length < numPIs) {
    for (const area of availableAreas) {
      if (selectedInstructionalArea && area === selectedInstructionalArea) continue; // Skip already added
      
      const areaPIs = clusterData[area as keyof typeof clusterData] as string[];
      if (areaPIs && areaPIs.length > 0) {
        areaPIs.forEach(pi => {
          allPIsWithAreas.push({
            pi,
            instructionalArea: area
          });
        });
      }
    }
  }
  
  if (allPIsWithAreas.length === 0) {
    console.warn(`No PIs found in cluster "${jsonClusterName}"`);
    return [];
  }
  
  // Randomly select the required number of PIs
  const selectedPIs: PIWithArea[] = [];
  const availablePIs = [...allPIsWithAreas]; // Create a copy to avoid modifying original
  
  for (let i = 0; i < Math.min(numPIs, availablePIs.length); i++) {
    const randomIndex = Math.floor(Math.random() * availablePIs.length);
    selectedPIs.push(availablePIs.splice(randomIndex, 1)[0]);
  }
  
  console.log(`Selected ${selectedPIs.length} PIs from ${selectedPIs.length > 0 ? selectedPIs.map(p => p.instructionalArea).join(', ') : 'no areas'}`);
  
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
    'Business Management & Administration': 'Business Management & Administration Career Cluster'
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