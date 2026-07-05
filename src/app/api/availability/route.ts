import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const barberId = req.nextUrl.searchParams.get("barberId");
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  const date = req.nextUrl.searchParams.get("date");

  if (!barberId || !serviceId || !date) {
    return NextResponse.json(
      { error: "barberId, serviceId, and date are required" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(barberId, serviceId, date);
  return NextResponse.json({ slots });
}
