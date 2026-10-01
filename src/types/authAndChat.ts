export type AppUserRole = 'OWNER' | 'DISPATCHER' | 'CLEANER';

export interface AppUser {
  id: string;
  name: string;
  role: AppUserRole;
  email: string;
  phone: string;
  avatar?: string;
  cleanerId?: string; // If role === 'CLEANER', references Technician.id (e.g. 'cleaner-1')
  assignedVan?: string;
  title: string;
  pin?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: AppUserRole;
  recipientId: string | 'BROADCAST_ALL'; // 'BROADCAST_ALL' or target user id
  recipientName?: string;
  text: string;
  timestamp: string;
  ticketId?: string; // Optional job reference
  read?: boolean;
}

export const APP_USERS: AppUser[] = [
  {
    id: 'user-owner',
    name: 'Business Owner',
    role: 'OWNER',
    email: 'cleaningserviceyeg@gmail.com',
    phone: '(780) 718-5092',
    title: 'Owner & Executive Director',
    pin: '1001',
  },
  {
    id: 'user-dispatcher',
    cleanerId: 'cleaner-15',
    name: 'Dominic Mancini',
    role: 'DISPATCHER',
    email: 'mittens45dm@gmail.com',
    phone: '(587) 385-8329',
    assignedVan: 'Unit 15 (Lead Mobile)',
    title: 'Lead Dispatcher & Operations Manager',
    pin: '2002',
  },
  // All 14 Fleet Cleaning Units
  {
    id: 'cleaner-1',
    cleanerId: 'cleaner-1',
    name: 'Melissa Clarke',
    role: 'CLEANER',
    email: 'clarkemelissa2025@gmail.com',
    phone: '(780) 954-2409',
    assignedVan: 'Unit 1 (Chappelle Hub)',
    title: 'Senior Cleaner',
    pin: '3001',
  },
  {
    id: 'cleaner-2',
    cleanerId: 'cleaner-2',
    name: 'Stacey Whitty',
    role: 'CLEANER',
    email: 'stacey_whitty44@hotmail.com',
    phone: '(825) 436-2409',
    assignedVan: 'Unit 2 (Charlesworth Hub)',
    title: 'Move-Out Detail Specialist',
    pin: '3002',
  },
  {
    id: 'cleaner-3',
    cleanerId: 'cleaner-3',
    name: 'Robyn Adele',
    role: 'CLEANER',
    email: 'robynkierstead@hotmail.com',
    phone: '(780) 660-0681',
    assignedVan: 'Unit 3 (Keheewin / South Hub)',
    title: 'Deep Clean & Sanitization Specialist',
    pin: '3003',
  },
  {
    id: 'cleaner-4',
    cleanerId: 'cleaner-4',
    name: 'Adison Haugland',
    role: 'CLEANER',
    email: 'hauglandadison@gmail.com',
    phone: '(780) 554-2851',
    assignedVan: 'Unit 4 (Oliver / Downtown Hub)',
    title: 'Condo & High-Rise Turnover Lead',
    pin: '3004',
  },
  {
    id: 'cleaner-5',
    cleanerId: 'cleaner-5',
    name: 'Joseph Juma',
    role: 'CLEANER',
    email: 'baraka.cleaningservices95@gmail.com',
    phone: '(780) 267-3472',
    assignedVan: 'Unit 5 (Clareview Hub)',
    title: 'Master Move-Out & Commercial Cleaner',
    pin: '3005',
  },
  {
    id: 'cleaner-6',
    cleanerId: 'cleaner-6',
    name: 'Asanti Sayida',
    role: 'CLEANER',
    email: 'asantisayida20@gmail.com',
    phone: '(825) 419-3215',
    assignedVan: 'Unit 6 (Ambleside / Windermere Hub)',
    title: 'Residential & Appliance Specialist',
    pin: '3006',
  },
  {
    id: 'cleaner-7',
    cleanerId: 'cleaner-7',
    name: 'Cindy Guay',
    role: 'CLEANER',
    email: 'cindybg@live.ca',
    phone: '(780) 863-0896',
    assignedVan: 'Unit 7 (Mill Woods Hub)',
    title: 'Eco-Sanitization & Turnover Cleaner',
    pin: '3007',
  },
  {
    id: 'cleaner-8',
    cleanerId: 'cleaner-8',
    name: 'Jasmin Kunin',
    role: 'CLEANER',
    email: 'kuninjasmin@gmail.com',
    phone: '(780) 802-3373',
    assignedVan: 'Unit 8 (Central Hub)',
    title: 'Residential & Move-Out Cleaner',
    pin: '3008',
  },
  {
    id: 'cleaner-9',
    cleanerId: 'cleaner-9',
    name: 'Jen & Bryan Cabugon',
    role: 'CLEANER',
    email: 'cedi.cleans@gmail.com',
    phone: '(825) 888-3251',
    assignedVan: 'Unit 9 (Secord / West Hub - Team)',
    title: 'Large Home & Tandem Move-Out Crew',
    pin: '3009',
  },
  {
    id: 'cleaner-10',
    cleanerId: 'cleaner-10',
    name: 'Sergine Ngongang',
    role: 'CLEANER',
    email: 'tatiwetie@gmail.com',
    phone: '(418) 261-4689',
    assignedVan: 'Unit 10 (Callingwood / West Hub)',
    title: 'Deep Cleaning Specialist',
    pin: '3010',
  },
  {
    id: 'cleaner-11',
    cleanerId: 'cleaner-11',
    name: 'Joel Mbatchou',
    role: 'CLEANER',
    email: 'mbatchoujoakim@yahoo.fr',
    phone: '(587) 937-9408',
    assignedVan: 'Unit 11 (Dechene / West Hub)',
    title: 'Turnover & Floor Care Cleaner',
    pin: '3011',
  },
  {
    id: 'cleaner-12',
    cleanerId: 'cleaner-12',
    name: 'Kilab Facility Services',
    role: 'CLEANER',
    email: 'kffsfacilityservice10@gmail.com',
    phone: '(647) 466-4476',
    assignedVan: 'Unit 12 (Westwood / North Central Hub)',
    title: 'Commercial & Office Specialist',
    pin: '3012',
  },
  {
    id: 'cleaner-13',
    cleanerId: 'cleaner-13',
    name: 'N. Dinku',
    role: 'CLEANER',
    email: 'bultoefa@gmail.com',
    phone: '(587) 500-7911',
    assignedVan: 'Unit 13 (Lorelei / North YEG Hub)',
    title: 'Move-Out & Cabinet Specialist',
    pin: '3013',
  },
  {
    id: 'cleaner-14',
    cleanerId: 'cleaner-14',
    name: 'Neth & Carmen',
    role: 'CLEANER',
    email: 'nhettemcarmen@yahoo.com',
    phone: '(780) 729-2031',
    assignedVan: 'Unit 14 (The Hamptons / West Hub - Team)',
    title: 'Two-Person Tandem Crew',
    pin: '3014',
  },
  {
    id: 'cleaner-16',
    cleanerId: 'cleaner-16',
    name: 'Danielle Pettipas',
    role: 'CLEANER',
    email: 'danielle.p@bookmycleaning.net',
    phone: '(780) 555-0116',
    assignedVan: 'Unit 16 (Meadowlark Hub)',
    title: 'Condo & Residential Detail Specialist',
    pin: '3016',
  },
  {
    id: 'cleaner-17',
    cleanerId: 'cleaner-17',
    name: 'Scott Chambers',
    role: 'CLEANER',
    email: 'scott.c@bookmycleaning.net',
    phone: '(780) 555-0117',
    assignedVan: 'Unit 17 (Old Strathcona Hub)',
    title: 'Move-Out Specialist',
    pin: '3017',
  },
  {
    id: 'cleaner-18',
    cleanerId: 'cleaner-18',
    name: 'Samantha Smits',
    role: 'CLEANER',
    email: 'samantha.s@bookmycleaning.net',
    phone: '(780) 555-0118',
    assignedVan: 'Unit 18 (Laurier Heights Hub)',
    title: 'Deep Clean Specialist',
    pin: '3018',
  },
  {
    id: 'cleaner-19',
    cleanerId: 'cleaner-19',
    name: 'Mike Brown',
    role: 'CLEANER',
    email: 'mike.b@bookmycleaning.net',
    phone: '(780) 555-0119',
    assignedVan: 'Unit 19 (Highlands Hub)',
    title: 'Commercial Cleaning Lead',
    pin: '3019',
  },
  {
    id: 'cleaner-20',
    cleanerId: 'cleaner-20',
    name: 'Jan Perrin',
    role: 'CLEANER',
    email: 'jan.p@bookmycleaning.net',
    phone: '(780) 555-0120',
    assignedVan: 'Unit 20 (University Belgravia Hub)',
    title: 'Turnover & Appliance Specialist',
    pin: '3020',
  },
];

export interface UserRolePermissions {
  canViewAllVans: boolean;
  canAssignTickets: boolean;
  canAccessBillingInvoices: boolean;
  canAccessQuotesPipeline: boolean;
  canAccessJobberConfig: boolean;
  canAccessQuoPhoneConfig: boolean;
  canViewOnlyAssignedJobs: boolean;
  canUpdateJobStatus: boolean;
  canChatWithAll: boolean;
}

export function getRolePermissions(role: AppUserRole): UserRolePermissions {
  switch (role) {
    case 'OWNER':
      return {
        canViewAllVans: true,
        canAssignTickets: true,
        canAccessBillingInvoices: true,
        canAccessQuotesPipeline: true,
        canAccessJobberConfig: true,
        canAccessQuoPhoneConfig: true,
        canViewOnlyAssignedJobs: false,
        canUpdateJobStatus: true,
        canChatWithAll: true,
      };
    case 'DISPATCHER':
      return {
        canViewAllVans: true,
        canAssignTickets: true,
        canAccessBillingInvoices: false, // Invoices reserved exclusively for Owner
        canAccessQuotesPipeline: true,   // Dispatcher can inspect job quotes
        canAccessJobberConfig: false,    // Jobber API secrets reserved for Owner
        canAccessQuoPhoneConfig: true,   // Dispatcher uses Quo 5-line calling system
        canViewOnlyAssignedJobs: false,
        canUpdateJobStatus: true,
        canChatWithAll: true,
      };
    case 'CLEANER':
    default:
      return {
        canViewAllVans: false,
        canAssignTickets: false,
        canAccessBillingInvoices: false,
        canAccessQuotesPipeline: false,
        canAccessJobberConfig: false,
        canAccessQuoPhoneConfig: false,
        canViewOnlyAssignedJobs: true,
        canUpdateJobStatus: true,
        canChatWithAll: true,
      };
  }
}
