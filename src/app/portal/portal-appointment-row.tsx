"use client";

import { useTransition } from "react";
import type { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "@/app/dashboard/appointments/actions";
import { SHOP_TIME_ZONE } from "@/lib/timezone";
import { StatusIcon } from "@/components/status-icon";

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "text-amber-400",
  CONFIRMED: "text-emerald-400",
  CANCELLED: "text-red-400",
  COMPLETED: "text-muted",
  NO_SHOW: "text-red-400",
};

export function PortalAppointmentRow({
  appointment,
}: {
  appointment: {
    id: string;
    clientName: string;
    clientPhone: string | null;
    serviceName: string;
    startTime: string;
    durationMin: number;
    status: AppointmentStatus;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: AppointmentStatus) {
    startTransition(() => {
      updateAppointmentStatus(appointment.id, status);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      <div>
        <p className="text-sm text-gold-soft">
          {new Date(appointment.startTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: SHOP_TIME_ZONE,
          })}
          <span className="ml-2 text-xs text-muted">
            {appointment.durationMin} min
          </span>
        </p>
        <p className="text-foreground">
          {appointment.clientName} &middot; {appointment.serviceName}
        </p>
        {appointment.clientPhone && (
          <p className="text-xs text-muted">{appointment.clientPhone}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <StatusIcon status={appointment.status} />
        <span
          className={`text-xs font-medium uppercase ${statusStyles[appointment.status]}`}
        >
          {appointment.status}
        </span>
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
      </div>
    </div>
  );
}
