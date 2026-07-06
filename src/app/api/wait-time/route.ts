import { NextResponse } from "next/server";
import { getEstimatedWaitMinutes } from "@/lib/wait-time";

export async function GET() {
  const minutes = await getEstimatedWaitMinutes();
  return NextResponse.json({ minutes });
}
