import React from 'react';
import InstructionsPage from '@/components/InstructionsPage.jsx';
import {
  Leaf,
  QrCode,
  Award,
  Gift,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting started',
    icon: Leaf,
    description: 'Set up your household account and get ready for your first verified pickup.',
    steps: [
      'Create an account and choose the Citizen role.',
      'Add your zone and neighborhood details so we can match you to the right collection route.',
      'Open your dashboard to see your next scheduled pickup and your green-token balance.',
      'Print the dustbin QR code from Profile → My Dustbin QR and stick it on your bin where the driver can see it.',
    ],
    note: 'Keep your profile name and zone up to date — the driver uses the zone to build the route.',
  },
  {
    id: 'dustbin-qr',
    title: 'Your dustbin QR code',
    icon: QrCode,
    description: 'The QR code is how a driver confirms that your bin was actually collected.',
    steps: [
      'Go to Profile → My Dustbin QR.',
      'Download or print the QR code. It contains a secure, unique token for your household.',
      'Stick the printed code on the outside of your bin. Laminate it or use a waterproof sleeve if possible.',
      'When the driver arrives, they scan the code from their app. A successful scan earns you Civic Points.',
      'If the code is lost or damaged, use Regenerate to invalidate the old one and create a new code.',
    ],
    bullets: [
      'Only the latest active token works; older tokens are disabled automatically.',
      'The QR code is tied to your registered address and GPS location.',
      'You can also show the QR code from your phone if the printed copy is damaged.',
    ],
    note: 'The driver must be within 50 m of your bin, plus GPS tolerance, for the scan to count. This prevents collection fraud.',
  },
  {
    id: 'civic-score',
    title: 'Earning Civic Score',
    icon: Award,
    description: 'Civic Score rewards consistent, verified waste segregation.',
    bullets: [
      'Daily verified pickup: +15 Civic Points.',
      'Accurate waste segregation: +30 Civic Points.',
      'Streak bonuses: +5 Civic Points.',
      'False complaints can reduce your score by 50 points.',
      'Everyone starts at 300 points. Civic Champion starts at 551 and Elite Guardian at 751.',
    ],
    note: 'Your score is capped between 300 and 900 points. Open Civic Score History from your profile to see every change.',
  },
  {
    id: 'rewards',
    title: 'Using the rewards store',
    icon: Gift,
    description: 'Redeem the green tokens you earn from verified activity.',
    steps: [
      'Open your Citizen Dashboard and scroll to the Rewards Store.',
      'Compare the token cost and description of each reward.',
      'Select Redeem on a reward you can afford.',
      'Collect or use your voucher according to the reward instructions.',
    ],
    note: 'Higher Civic Score tiers unlock exclusive discounts on rewards. Your token balance updates immediately after redemption.',
  },
  {
    id: 'complaints',
    title: 'Filing a complaint',
    icon: MessageSquare,
    description: 'Report missed pickups, overflowing bins, or other collection problems.',
    steps: [
      'From your dashboard, choose Submit Complaint.',
      'Select the issue type and add a short description.',
      'Attach a photo when possible — it helps the admin team resolve the issue faster.',
      'Submit the complaint and check your dashboard for status updates.',
    ],
    note: 'Complaints are reviewed by your zone admin. Repeated false complaints can affect your Civic Score.',
  },
  {
    id: 'pickup-day',
    title: 'On pickup day',
    icon: Calendar,
    description: 'A little preparation makes verification quick and reliable.',
    bullets: [
      'Put the bin out before your scheduled pickup time.',
      'Keep the QR code clean and facing the street.',
      'Separate wet and dry waste as instructed by your municipality.',
      'If a pickup is missed, wait until the end of the window before filing a complaint.',
    ],
  },
];

const faqs = [
  {
    question: 'Why did the driver’s scan show a location mismatch?',
    answer:
      'The driver was outside the allowed distance from your registered bin location. Ask them to move closer and retry. If your bin has moved permanently, regenerate the QR code from your current location.',
  },
  {
    question: 'Can I use a screenshot of my QR code?',
    answer:
      'Yes. The driver scans the token, not the printed paper, so a clear screenshot works. Make sure the whole code is visible and the screen is bright.',
  },
  {
    question: 'What happens if I regenerate my QR code?',
    answer:
      'The old code stops working immediately. Print or save the new code and replace the old sticker on your bin.',
  },
  {
    question: 'How often can I earn pickup points?',
    answer:
      'A verified pickup earns points once per collection. Duplicate scans on the same day are still logged but do not keep awarding points.',
  },
  {
    question: 'I redeemed a reward but did not receive it. What should I do?',
    answer:
      'Redemptions start as pending and are processed by your zone team. If it stays pending for more than a few days, file a complaint with the reward name and date.',
  },
];

const CitizenInstructions = () => (
  <InstructionsPage
    roleName="Citizen"
    toneKey="citizen"
    title="Citizen instructions"
    subtitle="Everything you need to set up your bin, earn Civic Points, redeem rewards, and get help when a collection goes wrong."
    heroIcon={Leaf}
    dashboardPath="/citizen-dashboard"
    sections={sections}
    faqs={faqs}
  />
);

export default CitizenInstructions;
