import { IssueReport, NotificationItem, UserProfile, CategoryEscalationConfig } from '../types';

export const CAMPUS_BUILDINGS = [
  'Computer Science Block (COE)',
  'Academic Block C (Mech & Civil)',
  'Academic Block B & Lecture Theatres',
  'Central Library & Knowledge Center',
  'Hostel Block J (Boys)',
  'Hostel Block Q (Girls)',
  'Hostel Block M (Boys)',
  'Hostel Block N (Girls)',
  'Central Cafeteria & Food Court',
  'Sports Complex & Gymnasium',
  'Central Workshop & Laboratories'
];

export const BUILDING_FLOORS = [
  'Basement',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor'
];

export const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'user-student-1',
    name: 'Nadeem Esrar',
    email: 'nesrar_be24@thapar.edu',
    role: 'student',
    rollNumber: '1024030291',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-student-2',
    name: 'Lavanya Sharma',
    email: 'lsharma3_be24@thapar.edu',
    role: 'student',
    rollNumber: '1024030227',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-faculty-1',
    name: 'Dr. Parismita Thapa',
    email: 'pthapa_be24@thapar.edu',
    role: 'faculty',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin-elec',
    name: 'Rajesh Verma (Electrical)',
    email: 'rajesh.verma@thapar.edu',
    role: 'admin',
    department: 'Electrical & Lighting',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin-plumb',
    name: 'Suresh Sharma (Plumbing)',
    email: 'suresh.sharma@thapar.edu',
    role: 'admin',
    department: 'Plumbing & Water Supply',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-super-admin',
    name: 'Dean Infrastructure & Facilities',
    email: 'superadmin.estate@thapar.edu',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_ESCALATION_CONFIGS: CategoryEscalationConfig[] = [
  {
    category: 'Electrical & Wiring',
    threshold: 3,
    isSafetyCritical: true,
    description: 'High risk of short circuits and shocks. Low upvote threshold for rapid action.'
  },
  {
    category: 'Plumbing Leak / Water Issue',
    threshold: 5,
    isSafetyCritical: false,
    description: 'Prevents water damage and supply outage in washrooms/hostels.'
  },
  {
    category: 'Washroom & Cleanliness',
    threshold: 5,
    isSafetyCritical: false,
    description: 'Daily sanitation standards for student blocks and high-density zones.'
  },
  {
    category: 'Projector / Audio / Lab Equipment',
    threshold: 4,
    isSafetyCritical: false,
    description: 'Disrupts classroom teaching and laboratory sessions.'
  },
  {
    category: 'AC / Ventilation Malfunction',
    threshold: 6,
    isSafetyCritical: false,
    description: 'Critical during summer heat across large lecture halls and computer labs.'
  },
  {
    category: 'Unsafe Walkway / Lighting Hazard',
    threshold: 3,
    isSafetyCritical: true,
    description: 'Pedestrian safety and night visibility around campus paths.'
  },
  {
    category: 'Broken Furniture / Structural',
    threshold: 8,
    isSafetyCritical: false,
    description: 'Cosmetic and structural repairs in classrooms and hostels.'
  },
  {
    category: 'Other Infrastructure',
    threshold: 5,
    isSafetyCritical: false,
    description: 'General campus facilities support.'
  }
];

export const DEFAULT_ESCALATION_CONFIG = {
  defaultUpvoteThreshold: 8,
  safetyCriticalThreshold: 4,
  autoEscalateHours: 48,
  categoryThresholds: {
    'Electrical & Wiring': 3,
    'Plumbing Leak / Water Issue': 5,
    'Broken Furniture / Structural': 8,
    'Washroom & Cleanliness': 5,
    'Projector / Audio / Lab Equipment': 4,
    'AC / Ventilation Malfunction': 6,
    'Unsafe Walkway / Lighting Hazard': 3,
    'Other Infrastructure': 5
  }
};

export const INITIAL_ISSUES: IssueReport[] = [
  {
    id: 'iss-101',
    ticketNumber: 'TIET-2026-0842',
    title: 'Exposed live wiring near water cooler in 2nd floor corridor',
    description: 'There is an unshielded loose electrical socket right beside the RO water dispenser. Water splashes during refilling create a severe electric shock hazard for students.',
    category: 'Electrical & Wiring',
    department: 'Electrical & Lighting',
    location: {
      building: 'Computer Science Block (COE)',
      floor: '2nd Floor',
      roomArea: 'Near Lab 204 & Water Cooler',
      landmarkDetails: 'Opposite Server Room B'
    },
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    status: 'Reported',
    priority: 'High',
    upvotes: 7,
    upvotedUserIds: ['user-student-1', 'user-student-2', 'user-student-3', 'user-student-4', 'user-faculty-1', 'user-student-5', 'user-student-6'],
    reportedBy: {
      id: 'user-student-1',
      name: 'Nadeem Esrar',
      email: 'nesrar_be24@thapar.edu',
      role: 'student',
      rollNumber: '1024030291',
      department: 'Computer Engineering'
    },
    createdAt: '2026-08-24T08:30:00.000Z',
    updatedAt: '2026-08-24T09:15:00.000Z',
    isEscalated: true,
    escalatedAt: '2026-08-24T09:15:00.000Z',
    commentsCount: 3,
    timeline: [
      {
        id: 'tl-1',
        status: 'Reported',
        timestamp: '2026-08-24T08:30:00.000Z',
        note: 'Issue submitted via Student Portal with photo attachment.',
        updatedBy: 'Nadeem Esrar',
        userRole: 'Student'
      },
      {
        id: 'tl-2',
        status: 'Reported',
        timestamp: '2026-08-24T09:15:00.000Z',
        note: '⚡ Auto-Escalated to HIGH PRIORITY: Crossed category upvote threshold (3 upvotes). Super-Admin and Electrical Dept notified.',
        updatedBy: 'System Auto-Escalation Engine',
        userRole: 'System'
      }
    ]
  },
  {
    id: 'iss-102',
    ticketNumber: 'TIET-2026-0839',
    title: 'Continuous water leakage from main flush pipe in washroom',
    description: 'Water is continuously leaking from the flush tank in the 3rd-floor boys washroom, causing waterlogging on the floor and slippery tiles.',
    category: 'Plumbing Leak / Water Issue',
    department: 'Plumbing & Water Supply',
    location: {
      building: 'Hostel Block J (Boys)',
      floor: '3rd Floor',
      roomArea: 'West Wing Washroom',
      landmarkDetails: 'Cubicle #3 opposite shower stalls'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    status: 'Ongoing',
    priority: 'Normal',
    upvotes: 4,
    upvotedUserIds: ['user-student-2', 'user-student-7', 'user-student-8', 'user-student-9'],
    reportedBy: {
      id: 'user-student-2',
      name: 'Lavanya Sharma',
      email: 'lsharma3_be24@thapar.edu',
      role: 'student',
      rollNumber: '1024030227',
      department: 'Computer Engineering'
    },
    createdAt: '2026-08-23T14:20:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    assignedTo: 'user-admin-plumb',
    assignedAdminName: 'Suresh Sharma',
    isEscalated: false,
    commentsCount: 2,
    timeline: [
      {
        id: 'tl-3',
        status: 'Reported',
        timestamp: '2026-08-23T14:20:00.000Z',
        note: 'Issue submitted via Student Portal.',
        updatedBy: 'Lavanya Sharma',
        userRole: 'Student'
      },
      {
        id: 'tl-4',
        status: 'Ongoing',
        timestamp: '2026-08-24T10:00:00.000Z',
        note: 'Assigned to plumbing technician Mukesh. Replacement washer and valve dispatched. ETA 3 hours.',
        updatedBy: 'Suresh Sharma',
        userRole: 'Plumbing Administrator'
      }
    ]
  },
  {
    id: 'iss-103',
    ticketNumber: 'TIET-2026-0820',
    title: 'Ceiling projector flickering and HDMI port disconnected',
    description: 'During morning lectures, the overhead digital projector shuts down every 5 minutes with color distortion. The wall HDMI socket is loose and causing class disruption.',
    category: 'Projector / Audio / Lab Equipment',
    department: 'IT & AV Equipment',
    location: {
      building: 'Academic Block B & Lecture Theatres',
      floor: '1st Floor',
      roomArea: 'Lecture Theatre LT-102',
      landmarkDetails: 'Main podium stage'
    },
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    status: 'Ongoing',
    priority: 'Normal',
    upvotes: 3,
    upvotedUserIds: ['user-faculty-1', 'user-student-1', 'user-student-4'],
    reportedBy: {
      id: 'user-faculty-1',
      name: 'Dr. Parismita Thapa',
      email: 'pthapa_be24@thapar.edu',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    },
    createdAt: '2026-08-23T10:00:00.000Z',
    updatedAt: '2026-08-23T16:30:00.000Z',
    assignedTo: 'admin-it-av',
    assignedAdminName: 'Karan Mehra (AV Tech)',
    isEscalated: false,
    commentsCount: 1,
    timeline: [
      {
        id: 'tl-5',
        status: 'Reported',
        timestamp: '2026-08-23T10:00:00.000Z',
        note: 'Reported by faculty member Dr. Parismita Thapa.',
        updatedBy: 'Dr. Parismita Thapa',
        userRole: 'Faculty'
      },
      {
        id: 'tl-6',
        status: 'Ongoing',
        timestamp: '2026-08-23T16:30:00.000Z',
        note: 'IT technician inspected: lamp unit replacement scheduled before 9 AM tomorrow.',
        updatedBy: 'Karan Mehra',
        userRole: 'IT Administrator'
      }
    ]
  },
  {
    id: 'iss-104',
    ticketNumber: 'TIET-2026-0795',
    title: 'AC unit dripping water onto quiet study tables',
    description: 'The split AC unit #4 in the second floor silent study zone is leaking condensation directly onto the wooden desks and student laptop charging points.',
    category: 'AC / Ventilation Malfunction',
    department: 'HVAC & Air Conditioning',
    location: {
      building: 'Central Library & Knowledge Center',
      floor: '2nd Floor',
      roomArea: 'Silent Reading Hall 2',
      landmarkDetails: 'Aisle 4 near journals section'
    },
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    status: 'Finished',
    priority: 'Normal',
    upvotes: 6,
    upvotedUserIds: ['user-student-1', 'user-student-2', 'user-student-3', 'user-student-4', 'user-student-5', 'user-student-6'],
    reportedBy: {
      id: 'user-student-1',
      name: 'Nadeem Esrar',
      email: 'nesrar_be24@thapar.edu',
      role: 'student',
      rollNumber: '1024030291',
      department: 'Computer Engineering'
    },
    createdAt: '2026-08-21T11:00:00.000Z',
    updatedAt: '2026-08-22T15:45:00.000Z',
    resolvedAt: '2026-08-22T15:45:00.000Z',
    assignedTo: 'admin-hvac',
    assignedAdminName: 'Deepak Gill',
    isEscalated: true,
    escalatedAt: '2026-08-21T17:00:00.000Z',
    commentsCount: 4,
    timeline: [
      {
        id: 'tl-7',
        status: 'Reported',
        timestamp: '2026-08-21T11:00:00.000Z',
        note: 'Issue submitted via Student Portal.',
        updatedBy: 'Nadeem Esrar',
        userRole: 'Student'
      },
      {
        id: 'tl-8',
        status: 'Ongoing',
        timestamp: '2026-08-21T14:30:00.000Z',
        note: 'HVAC repair team assigned. Condensate pipe unclogging initiated.',
        updatedBy: 'Deepak Gill',
        userRole: 'HVAC Administrator'
      },
      {
        id: 'tl-9',
        status: 'Finished',
        timestamp: '2026-08-22T15:45:00.000Z',
        note: 'Drainage pipe unblocked, insulation resealed, and tested for 2 hours under load. Fully functional.',
        updatedBy: 'Deepak Gill',
        userRole: 'HVAC Administrator'
      }
    ]
  },
  {
    id: 'iss-105',
    ticketNumber: 'TIET-2026-0850',
    title: 'Broken wooden benches & protruding nails in spectator gallery',
    description: 'Two benches in the indoor badminton court gallery have cracked wooden slats with sharp exposed nails, posing safety risk during evening sports.',
    category: 'Broken Furniture / Structural',
    department: 'Civil & Infrastructure',
    location: {
      building: 'Sports Complex & Gymnasium',
      floor: 'Ground Floor',
      roomArea: 'Badminton Hall Gallery',
      landmarkDetails: 'Row 2 near Court #1'
    },
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    status: 'Reported',
    priority: 'Normal',
    upvotes: 2,
    upvotedUserIds: ['user-student-2', 'user-faculty-1'],
    reportedBy: {
      id: 'user-student-2',
      name: 'Lavanya Sharma',
      email: 'lsharma3_be24@thapar.edu',
      role: 'student',
      rollNumber: '1024030227',
      department: 'Computer Engineering'
    },
    createdAt: '2026-08-24T11:20:00.000Z',
    updatedAt: '2026-08-24T11:20:00.000Z',
    isEscalated: false,
    commentsCount: 0,
    timeline: [
      {
        id: 'tl-10',
        status: 'Reported',
        timestamp: '2026-08-24T11:20:00.000Z',
        note: 'Issue submitted via Student Portal.',
        updatedBy: 'Lavanya Sharma',
        userRole: 'Student'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    issueId: 'iss-101',
    ticketNumber: 'TIET-2026-0842',
    type: 'escalation',
    title: '⚡ Issue Escalated to High Priority',
    message: 'Your report "Exposed live wiring near water cooler" crossed 3 upvotes and was escalated directly to Super-Admin!',
    read: false,
    timestamp: '2026-08-24T09:15:00.000Z'
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    issueId: 'iss-104',
    ticketNumber: 'TIET-2026-0795',
    type: 'status_change',
    title: '✅ Issue Resolved: Finished',
    message: 'AC unit dripping water in Central Library has been fixed and verified by Deepak Gill (HVAC Dept).',
    read: true,
    timestamp: '2026-08-22T15:45:00.000Z'
  },
  {
    id: 'notif-3',
    userId: 'user-student-2',
    issueId: 'iss-102',
    ticketNumber: 'TIET-2026-0839',
    type: 'status_change',
    title: '🔄 Status Updated to Ongoing',
    message: 'Your plumbing report for Hostel Block J is now Ongoing. Technician assigned with ETA 3 hours.',
    read: false,
    timestamp: '2026-08-24T10:00:00.000Z'
  },
  {
    id: 'notif-4',
    userId: 'user-super-admin',
    issueId: 'iss-101',
    ticketNumber: 'TIET-2026-0842',
    type: 'escalation',
    title: '🚨 Super-Admin Alert: High Priority Safety Issue',
    message: 'Safety-critical electrical hazard reported in Computer Science Block (2nd Floor) has escalated (7 upvotes).',
    read: false,
    timestamp: '2026-08-24T09:15:00.000Z'
  },
  {
    id: 'notif-5',
    userId: 'user-admin-elec',
    issueId: 'iss-101',
    ticketNumber: 'TIET-2026-0842',
    type: 'new_report',
    title: '⚡ New Electrical Report Assigned',
    message: 'New high-priority report logged in COE Block 2nd Floor requiring immediate action.',
    read: false,
    timestamp: '2026-08-24T08:30:00.000Z'
  }
];

// Sample photos that users can quickly choose from if they don't upload a file
export const PHOTO_PRESETS = [
  {
    label: '⚡ Exposed Wiring',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: '🚰 Plumbing Leak',
    url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: '📽️ Classroom Projector',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: '❄️ AC Leakage',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: '🪑 Damaged Furniture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: '💡 Flickering Light',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'
  }
];

export const SAMPLE_ISSUES: IssueReport[] = INITIAL_ISSUES;
