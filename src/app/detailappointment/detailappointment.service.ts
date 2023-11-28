import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandler } from '../_services/error-handler.service';
import { AppointmentDetail } from './detailappointment.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}
@Injectable()
export class DetailAppointmentService {
  constructor(private http: HttpClient, private eh: ErrorHandler) {

  }

  getAppointmentDetails(id: number): Observable<{ data: AppointmentDetail, status: string }> {
    return this.http.get<{ data: AppointmentDetail, status: string }>(`${environment.apiUrl}merchantAppointments/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: AppointmentDetail, status: string }>('Failed to get appointment details'))
    );
  }
  getReportsProductDetails(id: number): Observable<{ data: any }> {
    // /bills/getid/
    return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}bills/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any }>('Failed to get report details'))
    );
  }
  getReportsServiceDetails(id: number): Observable<{ data: any }> {
    // /bills/getid/
    return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}getService/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any }>('Failed to get report details'))
    );
  }

  deleteService(data: any): Observable<{ data: any, status: string }> {
    return this.http.post<{ data: AppointmentDetail, status: string }>(`${environment.apiUrl}deleteAppointmentServiceTemporary`, {
      "appointment_id": data.appointmentId,
      "merchant_store_service_id": data.serviceId,
      "professionist_account_id": data.professionistAccountId


    }, httpOptions).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: AppointmentDetail, status: string }>('Failed to get appointment details'))
    );
  }



  sendReceiptThroughEmail(data: any): Observable<{ data: any }> {
    // /bills/getid/
    return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}/sendReceipt`, {
      "toEmail": data.email,
      "receiptLink": `${environment.receiptUrl}${data.path}`
    }, httpOptions).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any }>('Failed to get report details'))
    );
  }

}