import React from 'react';
import InstructionsPage from '@/components/InstructionsPage.jsx';
import {
  Truck,
  ScanLine,
  Map,
  Navigation,
  AlertTriangle,
  Gauge,
  MessageSquare,
} from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting started',
    icon: Truck,
    description: 'Your driver account controls the route, the scanner, and your performance record.',
    steps: [
      'Sign in with the driver account created by your administrator.',
      'Confirm that your truck number and assigned zone are correct on the dashboard.',
      'Allow camera and location permissions when your browser asks — both are required for QR verification.',
      'Start your route from the Driver Operations dashboard and work through the bins in priority order.',
    ],
    note: 'If your truck number or zone is wrong, contact an administrator before starting collections. Scans are tied to your account.',
  },
  {
    id: 'scanning',
    title: 'Scanning a bin QR code',
    icon: ScanLine,
    description: 'The scanner verifies both the bin token and your distance from the registered bin.',
    steps: [
      'On the driver dashboard, tap Scan Bin QR.',
      'Wait for the GPS indicator to show a reading. A smaller accuracy number means a better fix.',
      'Point the camera at the QR code on the bin and hold it steady inside the frame.',
      'The app checks the token and your distance from the bin automatically.',
      'A green Bin Verified result means the pickup was logged. A location mismatch means you need to move closer.',
      'If the camera cannot read the code, switch to Manual Entry and type the token shown on the bin.',
    ],
    bullets: [
      'You must be within 50 m of the bin, plus a small GPS tolerance.',
      'The app shows your actual distance and GPS accuracy when a scan fails.',
      'Only active tokens work. An invalid token usually means the citizen regenerated their code.',
      'Every attempt is logged, including mismatches and invalid tokens.',
    ],
    note: 'Good practice: stand beside the bin, not inside a truck or building, and wait a few seconds for the GPS to settle before scanning.',
  },
  {
    id: 'gps',
    title: 'GPS and location best practices',
    icon: Navigation,
    description: 'Accurate location readings make verification faster and fairer for everyone.',
    bullets: [
      'Enable high-accuracy location on your phone.',
      'Step outside the vehicle if the signal is weak.',
      'Wait for the accuracy display to stabilise before scanning.',
      'If accuracy is worse than about 30 m, retry before assuming the location is wrong.',
      'Never spoof or fake your location — mismatches and anomalies are visible to admins.',
    ],
    note: 'The geofence is intentionally forgiving: 50 m base radius plus up to 30 m of reported GPS accuracy.',
  },
  {
    id: 'routes',
    title: 'Route management',
    icon: Map,
    description: 'Use the route map to plan the most efficient collection order.',
    steps: [
      'Review the route map and the list of bins in your assigned zones.',
      'Prioritise overflowing or critical bins first.',
      'Scan each bin as you collect it so the route progress stays accurate.',
      'Finish the route and check Today’s Scans for any missed or failed verifications.',
    ],
    note: 'The scan counter compares completed scans with the bins on your route. Investigate gaps before ending your shift.',
  },
  {
    id: 'mismatches',
    title: 'Handling mismatches and complaints',
    icon: AlertTriangle,
    description: 'Most scan failures are caused by distance, GPS signal, or an old QR code.',
    steps: [
      'Read the distance and accuracy shown on the mismatch screen.',
      'Move closer to the bin and tap Try Again.',
      'If the code is damaged, use Manual Entry with the token printed under the QR code.',
      'If the token is invalid, ask the citizen to regenerate it from Profile → My Dustbin QR.',
      'Report repeated problems through the complaint flow so the admin team can follow up.',
    ],
    note: 'Do not scan the same bin repeatedly to force a success. All attempts are recorded and reviewed.',
  },
  {
    id: 'performance',
    title: 'Performance and pay',
    icon: Gauge,
    description: 'Your dashboard tracks scans, strikes, and daily wage adjustments.',
    bullets: [
      'Completed verified pickups count toward your route progress.',
      'Repeated mismatches or missed bins can add strikes.',
      'Strikes reduce the daily wage by 15% per strike in the performance tracker.',
      'Admins can review scan history and adjust payroll from the admin panel.',
    ],
    note: 'Keep your contact details current so payroll and zone updates reach you.',
  },
  {
    id: 'support',
    title: 'Getting support',
    icon: MessageSquare,
    description: 'When something is not working, collect the details before asking for help.',
    bullets: [
      'Note the bin address, token, time, and the error message.',
      'Take a screenshot of the mismatch screen if possible.',
      'Contact your zone administrator or raise a support complaint.',
      'For camera or GPS permission problems, check your browser site settings first.',
    ],
  },
];

const faqs = [
  {
    question: 'Why does the scanner say location mismatch when I am standing at the bin?',
    answer:
      'Phone GPS can drift by tens of metres. Check the accuracy shown on screen, wait a few seconds for a better fix, and retry. The app allows 50 m plus up to 30 m of reported accuracy.',
  },
  {
    question: 'The camera will not open. What should I do?',
    answer:
      'Allow camera access in your browser settings, then reload the dashboard. If the camera still fails, use Manual Entry and type the token printed on the bin.',
  },
  {
    question: 'What does “invalid or inactive token” mean?',
    answer:
      'The QR code is not linked to an active bin. The citizen may have regenerated their code. Ask them to open Profile → My Dustbin QR and show or reprint the current code.',
  },
  {
    question: 'Can I scan a bin without location permission?',
    answer:
      'No. Location is required to prove the driver was at the bin. Enable location for the site and try again.',
  },
  {
    question: 'How do strikes affect my pay?',
    answer:
      'Each strike reduces the daily wage shown in the performance tracker by 15%. Your administrator can review and adjust payroll records.',
  },
  {
    question: 'Do failed scans count against me?',
    answer:
      'They are logged for auditing. A single GPS-related mismatch is normal, but repeated failures at the same location are reviewed.',
  },
];

const DriverInstructions = () => (
  <InstructionsPage
    roleName="Driver"
    toneKey="driver"
    title="Driver instructions"
    subtitle="Learn how to scan bin QR codes, handle GPS mismatches, manage your route, and protect your performance record."
    heroIcon={Truck}
    dashboardPath="/driver-dashboard"
    sections={sections}
    faqs={faqs}
  />
);

export default DriverInstructions;
