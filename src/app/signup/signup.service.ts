import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandler } from '../_services/error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()

export class SignupService {

  constructor(private http: HttpClient, private eh: ErrorHandler) { }

  createAccount(obj) {
    return this.http.post<{
      data: { data: boolean, roleCodes: string[] },
      status: string
    }>(`${environment.apiUrl}register`, obj, httpOptions)
      .pipe(
        tap(_ => console.log('created mobilenumber', _)),
        catchError(this.eh.handleHttpError<{ data: { data: boolean, roleCodes: string[] }, status: string }>('setmobilenumber'))
      );
  }

  otpauth(OTP, val) {
    return this.http.post<{ data: { id: number }, status: string }>(`${environment.apiUrl}OTPAuth`, {
      mobileNo: val,
      otp: OTP
    }, httpOptions)
      .pipe(
        tap(_ => console.log('OTP Authentication', _)),
        catchError(this.eh.handleHttpError<{ data: { id: number }, status: string }>('authentication error'))
      );
  }
  verifyOtp(postData) {
    return this.http.post<{ data: boolean; status: string }>(`${environment.apiUrl}verifyOtp`, postData, httpOptions)
      .pipe(
        tap(_ => console.log('Verify OTP Authentication', _)),
        catchError(this.eh.handleHttpError<{ data: boolean; status: string }>('Verify OTP Authentication'))
      );
  }

  otpresend(postData) {
    return this.http.post<{ data: boolean; status: string }>(`${environment.apiUrl}resendOtp`, postData, httpOptions)
      .pipe(
        tap(_ => console.log('resend OTP Authentication', _)),
        catchError(this.eh.handleHttpError<{ data: boolean; status: string }>('resend OTP Error'))
      );
  }
}
