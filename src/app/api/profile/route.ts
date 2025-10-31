import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessName, 
      businessSlug, 
      address, 
      description, 
      phone, 
      logo,
      logoUrl,
      payoutFrequency,
      notificationsEmail,
      notificationsWhatsApp,
      emailRemindersEnabled,
    } = body;

    // Generate slug from business name if not provided
    let slug = businessSlug;
    if (!slug && businessName) {
      slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Ensure slug is unique
      const existingUser = await prisma.user.findUnique({
        where: { businessSlug: slug },
      });
      
      if (existingUser && existingUser.id !== userId) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        businessName: businessName !== undefined ? businessName : undefined,
        businessSlug: slug || undefined,
        address: address !== undefined ? address : undefined,
        description: description !== undefined ? description : undefined,
        phone: phone !== undefined ? phone : undefined,
        logo: logo !== undefined ? logo : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        payoutFrequency: payoutFrequency !== undefined ? payoutFrequency : undefined,
        notificationsEmail: notificationsEmail !== undefined ? notificationsEmail : undefined,
        notificationsWhatsApp: notificationsWhatsApp !== undefined ? notificationsWhatsApp : undefined,
        emailRemindersEnabled: emailRemindersEnabled !== undefined ? emailRemindersEnabled : undefined,
        profileCompleted: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
