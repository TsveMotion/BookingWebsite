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

    // Build update data object, handling null values explicitly
    const updateData: any = {
      profileCompleted: true,
    };

    if (businessName !== undefined) updateData.businessName = businessName;
    if (slug !== undefined) updateData.businessSlug = slug;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (logo !== undefined) updateData.logo = logo;
    
    // Handle logoUrl explicitly to allow null (removal)
    if ('logoUrl' in body) updateData.logoUrl = logoUrl;
    
    if (payoutFrequency !== undefined) updateData.payoutFrequency = payoutFrequency;
    if (notificationsEmail !== undefined) updateData.notificationsEmail = notificationsEmail;
    if (notificationsWhatsApp !== undefined) updateData.notificationsWhatsApp = notificationsWhatsApp;
    if (emailRemindersEnabled !== undefined) updateData.emailRemindersEnabled = emailRemindersEnabled;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
