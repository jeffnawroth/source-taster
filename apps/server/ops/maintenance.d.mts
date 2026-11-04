export function maintenanceNotice(file: string | undefined): Promise<{
  state: string;
  startsAt?: string;
  endsAt?: string;
  timeZone?: string;
  de?: string;
  en?: string;
}>;
