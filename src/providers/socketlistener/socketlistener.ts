import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

@Injectable()
export class SocketlistenerProvider {
  public WS_URL:string = "ws://localhost:8080";

  //public WS_URL:string = "ws://nodejs-mongo-persistent-nodemongo8.193b.starter-ca-central-1.openshiftapps.com";
  //public WS_URL:string = "ws://nodechat2-nodechat2.1d35.starter-us-east-1.openshiftapps.com";
  //public WS_URL:string = "ws://nodechat2-nodechat2.1d35.starter-us-east-1.openshiftapps.com/ws";
  //public WS_URL:string = "ws://red-stream.herokuapp.com/ws";
  //public WS_URL:string = "ws://nodechat2.cloudno.de/ws";
  

  private ws:WebSocket;

  public wsVideo:WebSocket;

  private _events: Events;

  constructor(events:Events) {
    this._events = events;
  }
  public connect() {
    this.ws = new WebSocket(this.WS_URL, ['echo-protocol']);

    this.ws.onmessage = this.handleMessageReceived.bind(this);

    this.ws.onopen = this.handleConnected.bind(this);

    this.ws.onerror = this.handleError.bind(this);

    this.ws.onclose = this.handleClose.bind(this);
  }
  public disconnect() {
    this.ws.onmessage = function () {};

    this.ws.onopen = function () {};

    this.ws.onerror = function () {};

    this.ws.onclose = function () {};

    this.ws.close();

    this.ws = null;
  }
  private handleMessageReceived(data) {
    this._events.publish('onmessage', data.data);
  }
  private handleConnected(data) {
    this._events.publish('onmessage', 'onwsconnect');
/*
    let msg = {
      uid:this.uid,
      msg:"connect"
    }
    this.ws.send(JSON.stringify(msg));*/
  }
  private handleClose(data) {
    this._events.publish('onmessage', 'onwsdisconnect');
    this.connect();
  }
  private handleError(err) {
    this._events.publish('onerror', err);
  }
  public sendMessage(msg) {
    this.ws.send(msg);
  }
}
