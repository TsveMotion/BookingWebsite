import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const locationId = searchParams.get("locationId");
    const staffId = searchParams.get("staffId");

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true, userId: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get business hours
    const preferences = await prisma.bookingPreferences.findUnique({
      where: { userId: service.userId },
    });

    // Parse date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    // Default business hours: 9am-5pm
    let openTime = "09:00";
    let closeTime = "17:00";

    if (preferences?.businessHours) {
      const hours = preferences.businessHours as any;
      if (hours[dayOfWeek]) {
        openTime = hours[dayOfWeek].open || openTime;
        closeTime = hours[dayOfWeek].close || closeTime;
      }
    }

    // Generate time slots
    const slots: string[] = [];
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);

    const startMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;
    const slotDuration = 30; // 30-minute slots

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }

    // Get existing bookings for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: service.userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "cancelled",
        },
        ...(staffId ? { staffId } : {}),
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => {
      const [hour, min] = slot.split(":").map(Number);
      const slotTime = new Date(targetDate);
      slotTime.setHours(hour, min, 0, 0);

      const slotEnd = new Date(slotTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

      // Check if slot overlaps with any existing booking
      return !existingBookings.some((booking) => {
        return (
          (slotTime >= booking.startTime && slotTime < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (slotTime <= booking.startTime && slotEnd >= booking.endTime)
        );
      });
    });

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
