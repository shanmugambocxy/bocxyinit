import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandler } from './error-handler.service';
import { AppointmentList } from '../_models/appointmentlist.model';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()

export class AppointmentListService {

  constructor(private http: HttpClient, private eh: ErrorHandler) { }

  getAppoinmentList(type: string, page: number, date: string, appointmentStatus: string) {
    var url = type == null ? `${environment.apiUrl}merchantAppointments?pagination=true&page=${page}&queryOrderType=FUTURE&status=${appointmentStatus}` : `${environment.apiUrl}merchantAppointments?pagination=true&page=${page}&type=${type}&queryOrderType=FUTURE&status=${appointmentStatus}`;
    url = date == null ? url : `${url}&bookingDate=${date}`;
    console.log(url);
    return this.http.get<{ data: AppointmentList[], status: string, perPage: number, totalCount: number, totalPages: number }>(url, httpOptions).
      pipe(tap(_ => console.log("Fetched appointment list")),
        catchError(this.eh.handleHttpError<{ data: AppointmentList[], status: string, perPage: number, totalCount: number, totalPages: number }>('', { data: [], status: 'Failed', perPage: 0, totalCount: 0, totalPages: 0 })));
  }

  updateAppointmentStatus(id: number, appointmentStatus: string, reason: string) {
    var data = reason == null ? { appointmentId: id, status: appointmentStatus } : { appointmentId: id, status: appointmentStatus, cancelReason: reason }
    return this.http.post<{ data: boolean, status: string }>(`${environment.apiUrl}appointmentStatus`, data, httpOptions).
      pipe(tap(_ => console.log("Appointment status updated")),
        catchError(this.eh.handleHttpError<{ data: boolean, status: string }>('', { data: false, status: 'Failed' })));
  }

  saveBilling(data: any): Observable<{ data: any, status: string, billId: any }> {
    console.log('data', data);

    return this.http.post<{ data: any, status: string, billId: any }>(`${environment.apiUrl}Addbills`, {
      "amount": data.amount,
      "paid": data.paid,
      "created_by": 1,
      "updated_by": 1,
      "discount": data.discount,
      "gitvoucher": data.gitvoucher,
      "modeofpayment": data.modeofpayment,
      "subtotal": data.subtotal,
      "tips": data.tips,
      "SGST": data.SGST,
      "CGST": data.CGST,
      "Grandtotal": data.Grandtotal,
      "paidAmount": data.paidAmount,
      "merchantStoreId": data.merchantStoreId,
      "due_date": data.due_date,
      "created_at": data.created_at,
      "updated_at": data.updated_at,
      "name": data.name,
      "phoneno": data.phoneno,
      "bill_Id": data.bill_Id,
      "products": data.products,
      // "Quantity": data.Quantity,
      // "Price": data.Price,
      "gender": data.gender,
      "type": data.type,
      "cash_paid_amount": data.cash_paid_amount,
      "card_paid_amount": data.card_paid_amount,
      "upi_paid_amount": data.upi_paid_amount,


      // "type":"inventory",
      // "storeId":"651d02b7391e55ce6109ccd6"
      // "amount":42.43,
      // "due_date":"2023-11-14 08:00:00",
      // "paid":12,
      // "created_at":"2023-11-14 08:00:00",
      // "updated_at":"2023-11-14 08:00:00",
      // "created_by":1,
      // "updated_by":1,
      // "discount":5.0,
      // "gitvoucher":"Apc123yyy",
      // "modeofpayment":"Credit Card",
      // "subtotal":21.23,
      // "tips":12.231,
      // "SGST":4.223,
      // "CGST":4.44,
      // "Grandtotal":8787,
      // "paidAmount":89, 
      // "name":"karthick",
      // "phoneno":"3479423947",
      // "merchantStoreId":89,
      // "bill_Id":34234,
      // "product_name":"Test product",
      // "Quantity":"best",
      // "Price":56

    }, httpOptions)
      .pipe(
        tap(_ => {
          console.log('response', _);
        }),
        catchError(this.eh.handleHttpError<{ data: any, status: string, billId: any }>('billing'))
      );
  }

  updateBilingstatus(apointmentid: any): Observable<{ apointmentid: any, }> {

    return this.http.post<{ apointmentid: any, status: string, billId: any }>(`${environment.apiUrl}updateBilingstatus`, {
      "Id": apointmentid,
      "billingstatus": "Billed"
    }, httpOptions)
      .pipe(
        tap(_ => {
          console.log('response', _);
        }),
        catchError(this.eh.handleHttpError<{ apointmentid: any }>('billing'))
      );
  }

  getBilling(): Observable<{ data: any, status: string }> {
    return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}bills`)
      .pipe(
        tap(_ => console.log('Fetched Account', _)),
        catchError(this.eh.handleHttpError<{ data: any, status: string }>('getAccountDetails'))
      );
  }
  getByStore(storeId: number) {
    console.log('storeid', storeId);

    return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}bills/store/${storeId}`)
      .pipe(
        tap(_ => console.log('getByStore', _)),
        catchError(this.eh.handleHttpError<{ data: any, status: string }>('getByStore'))
      );
  }

  getProductSalesList(data: any) {
    return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}productreport`, {

      "startDate": data.startDate,
      "endDate": data.endDate

    }, httpOptions)
      .pipe(
        tap(_ => console.log('getProductSalesList', _)),
        catchError(this.eh.handleHttpError<{ data: any, status: string }>('getProductSalesList'))
      );
  }

  getServiceSalesList(data: any) {
    return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}serviceReport`, {
      "Id": data.id,
      "start_date": data.startDate,
      "end_date": data.endDate

    }, httpOptions)
      .pipe(
        tap(_ => console.log('getProductSalesList', _)),
        catchError(this.eh.handleHttpError<{ data: any, status: string }>('getProductSalesList'))
      );
  }

}