import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandler } from '../_services/error-handler.service';
import { AppointmentDetail } from './detailappointment.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',

  })
}
const httpOptionsWhatsapp = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'authkey': '403863AUKyZNWx665242ee9P1'
  })
}

@Injectable()
export class DetailAppointmentService {
  sendWhatsappUrl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/'
  constructor(private http: HttpClient, private eh: ErrorHandler) {

  }

  getAppointmentDetails(id: number): Observable<{ data: AppointmentDetail, status: string }> {
    return this.http.get<{ data: AppointmentDetail, status: string }>(`${environment.apiUrl}merchantAppointments/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: AppointmentDetail, status: string }>('Failed to get appointment details'))
    );
  }
  deleteProductDetails(id) {
    return this.http.delete<{ data: any, status: string }>(`${environment.apiUrl}delAddproduct/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any, status: string }>('Failed to delete product details'))
    );
  }
  getProductDetails(id: number): Observable<{ data: any, status: string }> {
    return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}getAddproduct/${id}`).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any, status: string }>('Failed to get product details'))
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
      "professionist_account_id": data.professionistAccountId,
      "appointment_booked_service_id": data.appointment_booked_service_id


    }, httpOptions).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: AppointmentDetail, status: string }>('Failed to get appointment details'))
    );
  }



  sendReceiptThroughEmail(data: any): Observable<{ data: any }> {
    // /bills/getid/
    // return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}sendReceipt`, {
    return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}sendMail`, {
      "toEmail": data.email,
      "receiptLink": `${environment.receiptUrl}${data.path}`
    }, httpOptions).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any }>('Failed to get report details'))
    );
  }


  sendToWhatsapp(data: any): Observable<{ data: any }> {

    return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}receipt_whatsapp`, {
      "receiverNumber": data.receiverNumber,
      "text1": data.text1,
      "text2": data.text2,
      "text3": `${environment.receiptUrl}${data.text3}`
    }, httpOptions).pipe(
      tap(),
      catchError(this.eh.handleHttpError<{ data: any }>('Failed to get report details'))
    );
    // /bills/getid/
    // var raw = JSON.stringify({
    //   "integrated_number": "918696983939",
    //   "content_type": "template",
    //   "payload": {
    //     // "to": "<Receivers number>",
    //     "to": "919600182649",

    //     "type": "template",
    //     "template": {
    //       "name": "bocxy",
    //       "language": {
    //         "code": "en_GB",
    //         "policy": "deterministic"
    //       },
    //       "components": [
    //         {
    //           "type": "body",
    //           "parameters": [
    //             {
    //               "type": "text",
    //               "text": "<{{1}}>"
    //             },
    //             {
    //               "type": "text",
    //               "text": "<{{2}}>"
    //             },
    //             {
    //               "type": "text",
    //               "text": "<{{3}}>"
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     "messaging_product": "whatsapp"
    //   }
    // });

    // var requestOptions = {
    //   method: 'POST',
    //   headers: httpOptionsWhatsapp,
    //   body: raw,
    //   redirect: 'follow'
    // };
    // return this.http.post<{ data: any, status: string }>(`${this.sendWhatsappUrl}`,
    //   {
    //     "integrated_number": "918696983939",
    //     "content_type": "template",
    //     "payload": {
    //       // "to": "<Receivers number>",
    //       "to": "919600182649",

    //       "type": "template",
    //       "template": {
    //         "name": "bocxy",
    //         "language": {
    //           "code": "en_GB",
    //           "policy": "deterministic"
    //         },
    //         "components": [
    //           {
    //             "type": "body",
    //             "parameters": [
    //               {
    //                 "type": "text",
    //                 "text": "<{{1}}>"
    //               },
    //               {
    //                 "type": "text",
    //                 "text": "<{{2}}>"
    //               },
    //               {
    //                 "type": "text",
    //                 "text": "<{{3}}>"
    //               }
    //             ]
    //           }
    //         ]
    //       },
    //       "messaging_product": "whatsapp"
    //     }
    //   }, httpOptionsWhatsapp).pipe(
    //     tap(),
    //     catchError(this.eh.handleHttpError<{ data: any }>('Failed to send msg'))
    //   );
  }

  sendWhatsappJs() {

  }

}