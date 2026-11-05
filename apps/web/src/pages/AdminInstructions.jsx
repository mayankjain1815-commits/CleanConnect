import React from 'react';
import InstructionsPage from '@/components/InstructionsPage.jsx';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Award,
  MessageSquare,
  Gift,
  Map,
  BarChart3,
  Settings,
} from 'lucide-react';

const sections = [
  {
    id: 'dashboard',
    title: 'Dashboard overview',
    icon: LayoutDashboard,
    description: 'The admin panel is the control room for city-wide operations.',
    bullets: [
      'Total bins, active drivers, and fund savings are shown at the top.',
      'Operations Overview combines the civic leaderboard, area heatmap, bin status, and driver performance.',
      'QR Scan Analytics shows verification volume, success rate, and mismatch patterns.',
      'Use Refresh Data after an import or a large batch of field activity.',
    ],
    note: 'Start each day with a quick scan of overflow/critical bins and drivers with new strikes.',
  },
  {
    id: 'users',
    title: 'User management',
    icon: Users,
    description: 'Citizens, drivers, and admins all use the same users collection with a role field.',
    bullets: [
      'Citizens have a linked citizen record with green tokens, zone, and pickup schedule.',
      'Drivers have a linked driver record with truck number, base wage, strikes, and wallet balance.',
      'Admins can view all records and manage role-specific data.',
      'Keep zone assignments accurate so routes and leaderboards stay correct.',
    ],
    note: 'Role changes should be rare. Verify the request before changing a user from citizen to driver or admin.',
  },
  {
    id: 'qr',
    title: 'QR codes and scan analytics',
    icon: QrCode,
    description: 'QR verification is the system of record for completed pickups.',
    steps: [
      'Open QR Scan Analytics to review total scans, success rate, and failures.',
      'Filter by status to find invalid tokens or repeated location mismatches.',
      'Investigate repeated mismatches at the same bin before assuming driver error.',
      'Ask a citizen to regenerate a token if their QR code is damaged or their address changed.',
      'Use scan history when resolving complaints about missed or disputed pickups.',
    ],
    note: 'Every scan stores distance, GPS coordinates, status, driver, and time. This is the audit trail for verification disputes.',
  },
  {
    id: 'civic-scores',
    title: 'Civic Score management',
    icon: Award,
    description: 'Civic Score drives citizen tiers, rewards discounts, and the leaderboard.',
    bullets: [
      'Scores start at 300 and are capped between 300 and 900.',
      'Daily verified pickup: +15. Accurate segregation: +30. Streak bonus: +5. False complaint: −50.',
      'Tiers: Eco-Novice (300–550), Civic Champion (551–750), Elite Guardian (751+).',
      'Review the civic score ledger for the reason and timestamp behind every change.',
    ],
    note: 'Score changes made by the system are also written to the ledger, so use the ledger as the source of truth.',
  },
  {
    id: 'complaints',
    title: 'Complaint management',
    icon: MessageSquare,
    description: 'Complaints connect citizen reports to operational follow-up.',
    bullets: [
      'Review new complaints by zone and age.',
      'Check the associated scan history before accepting or rejecting a missed-pickup claim.',
      'Assign follow-up to the responsible driver or route.',
      'Keep statuses current so citizens can see progress.',
    ],
    note: 'False complaints can reduce a citizen’s score by 50 points. Only apply that after reviewing the evidence.',
  },
  {
    id: 'rewards',
    title: 'Rewards management',
    icon: Gift,
    description: 'Rewards turn verified activity into tangible value for citizens.',
    bullets: [
      'Maintain a clear token cost and description for every reward.',
      'Keep stock and redemption instructions accurate.',
      'Process pending redemptions in a timely manner.',
      'Retire expired rewards instead of deleting records that citizens may reference.',
    ],
  },
  {
    id: 'routes',
    title: 'Route management',
    icon: Map,
    description: 'Routes connect drivers to the zones and bins they serve.',
    bullets: [
      'Assign each driver to the correct zone and truck.',
      'Review the area heatmap for ghost-scheduled or consistently missed areas.',
      'Balance routes so a single driver is not responsible for too many critical bins.',
      'Use scan completion data to spot route gaps.',
    ],
    note: 'A route with many invalid-token scans usually points to stale citizen QR codes in that zone.',
  },
  {
    id: 'analytics',
    title: 'Analytics and reports',
    icon: BarChart3,
    description: 'Use the data to find leakage, improve coverage, and measure outcomes.',
    bullets: [
      'Fund savings come from documented payroll deductions.',
      'Bin fill levels and status identify smart-bin maintenance needs.',
      'Scan success rate is the quickest health check for field operations.',
      'Export or screenshot key metrics before major process changes for comparison.',
    ],
  },
  {
    id: 'settings',
    title: 'System settings',
    icon: Settings,
    description: 'Configuration lives in the backend and should be changed carefully.',
    bullets: [
      'Collection rules on PocketBase protect citizen, driver, and admin data.',
      'Only admins can delete core operational records.',
      'Test configuration changes on a staging copy before applying them to live data.',
      'Keep the PocketBase version and migrations under version control.',
    ],
    note: 'A migration is the safest way to change schema or rules — avoid editing live collections by hand.',
  },
];

const faqs = [
  {
    question: 'How do I add a new admin or driver?',
    answer:
      'Create the user through the normal signup flow, then set the role field and the matching driver record. Do not create role records without the linked user.',
  },
  {
    question: 'A driver reports constant location mismatches at one bin. What should I check?',
    answer:
      'Compare the stored bin latitude/longitude with the real address, check the GPS accuracy in the scan record, and confirm the citizen did not move the bin. Regenerating the token from the correct location fixes stale coordinates.',
  },
  {
    question: 'Why are some QR scans marked invalid?',
    answer:
      'The token was not found or was inactive. This normally means the citizen regenerated their code or the sticker is from an older token.',
  },
  {
    question: 'Can I edit a Civic Score directly?',
    answer:
      'Use the ledger and score utilities so changes stay auditable. Direct edits bypass the reason trail and make disputes harder to resolve.',
  },
  {
    question: 'How is fund savings calculated?',
    answer:
      'The admin dashboard sums deduction amounts from payroll adjustments. It does not include unrecorded deductions.',
  },
  {
    question: 'What should I do before changing database rules?',
    answer:
      'Take a backup, review the rule against each role, and test it on a copy. Rule mistakes can block drivers from scanning or expose citizen data.',
  },
];

const AdminInstructions = () => (
  <InstructionsPage
    roleName="Admin"
    toneKey="admin"
    title="Admin instructions"
    subtitle="A practical guide to managing users, QR verification, Civic Scores, complaints, rewards, routes, and system settings."
    heroIcon={LayoutDashboard}
    dashboardPath="/admin-panel"
    sections={sections}
    faqs={faqs}
  />
);

export default AdminInstructions;
