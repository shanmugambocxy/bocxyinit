export class OnGoingAppointment {
  appointmentId: number;
  services: string;
  bookingDate: string;
  stylistName: string;
  color: string;
  slotStartTime: string;
  slotEndTime: string;
  billing: any;
  customername: any;
  totalPriceExpected: number;
  ProductTotalPrice: number;
}

export class Stylist {
  firstName: string;
  accountId: number
}