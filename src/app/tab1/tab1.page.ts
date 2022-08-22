import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  ws: WebSocket;
  socketIsOpen = 1;
  message = '';
  messages = [];
  currentUser = '';
  esp32Message: Subject<string> = new Subject();
  percent: number;
  private eventSource: EventSource = new EventSource("http://192.168.0.168:80/events");

  constructor(private socket: Socket, private http: HttpClient, private _zone: NgZone) {

  }


  public sendRequest() {
    this.http.get<string>("http://192.168.0.197:8080/foo/aha")
      .subscribe(res => console.log(res));
  }

  ngOnInit(): void {

    // this.getSSe()
    //     .subscribe((data: MessageEvent) => console.log(data.data));

    //     this.eventSource.addEventListener("temperature", (ev: MessageEvent) => {
    //       console.log("Temperatur : " + ev.data + " ° C");
          
    //   })

    //   this.eventSource.addEventListener("humidity", (ev: MessageEvent) => {
    //     console.log("Luftfeuchtigkeit : " + ev.data + " %");
    // })



    this.esp32Message.next('Not connected');
    this.socket.connect();
    this.socket.on("error", err => console.log('Error with websocket : ' + err))
    this.socket.on('connect', () => console.log("Connection socket : "))


    this.createObservableSocket("ws://192.168.178.40:80/ws")
      .subscribe(
        data => {
          console.log(data);

        },
        err => console.log('err'),
        () => console.log('The observable stream is complete')
      );










  }

  sendMsg() {
    this.socket.emit('send-message', JSON.stringify({ message: "FOO" }));
    this.message = '';
  }

  createObservableSocket(url: string): Observable<any> {
    this.ws = new WebSocket(url);
    console.log(this.ws.url);
    return new Observable(
      observer => {

        this.ws.onopen = (event) => {
          console.log('connected to ESP32');
          this.esp32Message.next("Connected");
        }

        this.ws.onmessage = (event) =>
          observer.next(event.data);

        this.ws.onerror = (event) => observer.error(event);

        this.ws.onclose = (event) => observer.complete();

        return () =>
          this.ws.close(1000, "The user disconnected");
      }
    );
  }

  sendMessage2(): void {
    console.log('Sers');
    console.log(this.sendMessage("FOO"));
  }

  sendMessage(message: string): string {
    console.log(this.ws);

    if (this.ws.readyState === this.socketIsOpen) {
      this.ws.send(JSON.stringify({ message: message }));
      return `Sent to server ${message}`;
    } else {
      return 'Message was not sent - the socket is closed';
    }
  }

  pressEvent(e) {
    const RATIO = (e / 100);
    if (RATIO < 100) {
      this.percent = RATIO;
      this.sendMessage(this.percent + "")
    }


  }

  getSSe() {
    return new Observable( (observer) => {
      const eventSource = this.getEventSource();      
      eventSource.onmessage = (event: MessageEvent) => {
        this._zone.run(() => {
          observer.next(event);
        });
      };
      eventSource.onerror = error => {
        this._zone.run(() => {
          observer.error(error);
        });
      };
    } )
  }

  public getEventSource(): EventSource {
    return this.eventSource;
  }

}


