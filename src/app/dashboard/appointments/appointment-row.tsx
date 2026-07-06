"use client";

import { useTransition } from "react";
import type { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "./actions";
import { SHOP_TIME_ZONE } from "@/lib/timezone";
import { StatusIcon } from "@/components/status-icon";

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "text-amber-400",
  CONFIRMED: "text-emerald-400",
  CANCELLED: "text-red-400",
  COMPLETED: "text-muted",
  NO_SHOW: "text-red-400",
};

export function AppointmentRow({
  appointment,
  showBarber,
  formattedPrice,
}: {
  appointment: {
    id: string;
    clientName: string;
    serviceName: string;
    barberName: string;
    startTime: string;
    priceCents: number;
    status: AppointmentStatus;
  };
  showBarber: boolean;
  formattedPrice: string;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: AppointmentStatus) {
    startTransition(() => {
      updateAppointmentStatus(appointment.id, status);
    });
  }

  return (
    <tr className="text-foreground/90">
      <td className="px-6 py-4">{appointment.clientName}</td>
      <td className="px-6 py-4">{appointment.serviceName}</td>
      {showBarber && <td className="px-6 py-4">{appointment.barberName}</td>}
      <td className="px-6 py-4">
        {new Date(appointment.startTime).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: SHOP_TIME_ZONE,
        })}
      </td>
      <td className="px-6 py-4">{formattedPrice}</td>
      <td className={`px-6 py-4 font-medium ${statusStyles[appointment.status]}`}>
        {appointment.status}
      </td>
      <td className="px-6 py-4 text-center">
        <StatusIcon status={appointment.status} />
      </td>
      <td className="px-6 py-4">
        <select
          disabled={isPending}
          value={appointment.status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs disabled:opacity-50"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No-show</option>
        </select>
      </td>
    </tr>
  );
}
