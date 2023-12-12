export class OnGoingAppointment {
  appointmentId: number;
  services: string;
  bookingDate: string;
  stylistName: string;
  color: string;
  slotStartTime: string;
  slotEndTime: string;
  billing: any;
}

export class Stylist {
  firstName: string;
  accountId: number
}