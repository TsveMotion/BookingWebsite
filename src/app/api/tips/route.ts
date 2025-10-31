import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface Tip {
  id: string;
  title: string;
  content: string;
  icon: string;
  gradient: string;
}

const tips: Tip[] = [
  {
    id: '1',
    title: 'Grow Your Business',
    content: 'Pro tip: Update your portfolio regularly with before/after photos to attract 3x more bookings!',
    icon: 'TrendingUp',
    gradient: 'bg-rose-gradient',
  },
  {
    id: '2',
    title: 'Client Retention',
    content: 'Send personalized follow-up messages within 24 hours to increase rebooking rates by 45%.',
    icon: 'Users',
    gradient: 'bg-lavender-gradient',
  },
  {
    id: '3',
    title: 'Customer Experience',
    content: 'Enable automated reminders to reduce no-shows by up to 60% and keep your schedule full!',
    icon: 'Heart',
    gradient: 'bg-blush-gradient',
  },
  {
    id: '4',
    title: 'Marketing Tip',
    content: 'Share your GlamBooking link on Instagram Stories with a "Book Now" sticker for instant bookings.',
    icon: 'Lightbulb',
    gradient: 'bg-luxury-gradient',
  },
  {
    id: '5',
    title: 'Pricing Strategy',
    content: 'Offer package deals (e.g., 3 sessions for the price of 2.5) to boost client loyalty and revenue.',
    icon: 'TrendingUp',
    gradient: 'bg-rose-gradient',
  },
  {
    id: '6',
    title: 'Peak Hours',
    content: 'Analyze your booking patterns to identify peak times and optimize your pricing accordingly.',
    icon: 'BarChart3',
    gradient: 'bg-lavender-gradient',
  },
  {
    id: '7',
    title: 'Social Proof',
    content: 'Ask satisfied clients for reviews and showcase them on your profile to build trust with new customers.',
    icon: 'Star',
    gradient: 'bg-blush-gradient',
  },
];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get a random tip each time
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return NextResponse.json(randomTip);
  } catch (error) {
    console.error('Error fetching tip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tip' },
      { status: 500 }
    );
  }
}
