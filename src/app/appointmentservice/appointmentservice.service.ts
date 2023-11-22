import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandler } from '../_services/error-handler.service';
import { Observable } from 'rxjs';
import { MerchantProduct, MerchantService } from '../tab3/merchantService.model';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Injectable()
export class AppointmentServiceService {

    constructor(private http: HttpClient, private eh: ErrorHandler) { }

    getMerchantServices(): Observable<{ data: MerchantService[], status: string }> {
        return this.http.get<{ data: MerchantService[], status: string }>(`${environment.apiUrl}merchantServiceList`, httpOptions).
            pipe(
                tap(_ => console.log("Merchant service")),
                catchError(this.eh.handleHttpError<{ data: MerchantService[], status: string }>('Merchant service', { data: [], status: "Failure" }))
            );
    }

    // getInventoryProducts(data: any) {
    //     console.log('req_data', data);
    //     return this.http.get<{ data: any, status: string }>(`${environment.apiUrl}inventory/gettypeProduct`, httpOptions).
    //         pipe(
    //             tap(_ => console.log("Merchant product")),
    //             catchError(this.eh.handleHttpError<{ data: any, status: string }>('Merchant service', { data: [], status: "Failure" }))
    //         );
    // }

    getInventoryProducts(data: any) {
        console.log('req_data', data);
        return this.http.post<{ data: any, status: string }>(`${environment.ecommApi}inventory/gettypeProduct`, {
            "type": data.type, "storeId": data.storeId
        }, httpOptions).
            pipe(
                tap(_ => console.log("Merchant product")),
                catchError(this.eh.handleHttpError<{ data: any, status: string }>('Merchant service', { data: [], status: "Failure" }))
            );


        // return this.http.post<{ data: any, status: string }>(`${environment.apiUrl}inventory/gettypeProduct`, {

        //     "type": data.type, "storeId": data.storeId
        // }).
        //     pipe(
        //         tap(_ => console.log("Merchant product")),
        //         catchError(this.eh.handleHttpError<{ data: any, status: string }>('Merchant service', { data: [], status: "Failure" }))
        //     );
    }





}