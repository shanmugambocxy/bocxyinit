import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { io, Socket } from 'socket.io-client';
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class SocketService {
    public socket: Socket;

    constructor() {
        // Replace 'http://your-socket-server-url' with the URL of your Socket.IO server
        // this.socket = io('http://192.168.1.7:8080', {
        // this.socket = io(environment.apiUrl, {

        //     transports: ['websocket'],
        //     // 'multiplex': false
        // },);

        // console.log('socket', this.socket);

        // this.socket.on('connect', () => {
        //     console.log('Connected to the server1', this.socket.connected);
        // });

        // this.socket.on('disconnect', () => {
        //     console.log('Disconnected from the server');
        // });

        // this.socket.on('connect_error', (error) => {
        //     console.error('Connection error:', error);
        // });

    }

    sendMessage(message: any) {
        // this.socket.emit('getData', message);


        this.socket.emit("clientData", message, (response) => {
            // console.log('response', response); // "got it"
        })



    }
    getMessage() {
        return new Observable<string>((observer) => {
            this.socket.on('serverResponse', (data: any) => {
                // console.log('data', data);

                observer.next(data);
            });
        });
    }
    sendSaleslistReport(message: any) {
        debugger
        let data = { "merchantStoreId": 62, "start_date": "2023-12-29 00:00", "end_date": "2023-12-29 24:00" };
        console.log('socket_______', this.socket.connected);

        this.socket.emit("salesreportRequest", data, (response) => {
            console.log('salesreportRequest', response);
            if (response) {
                // "got it"

            }
        });


    }
    getSalesReportMessage() {
        debugger
        return new Observable<string>((observer) => {
            this.socket.on('salesreportResponse', (data: any) => {
                console.log('salesreportResponse', data);

                if (data) {

                    observer.next(data);
                }

            });
        });
    }


    disconnect() {
        this.socket.disconnect();
    }


}