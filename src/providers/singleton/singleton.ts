import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
/*
  Generated class for the SingletonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SingletonProvider {

  public SERVICE:string = "http://red-manager.cloudno.de/api/";
  //public SERVICE:string = "http://localhost:8080/api/";

  public SERVICE_TICKETS:string = this.SERVICE + "getticket";
  public SERVICE_CREDITS:string = this.SERVICE + "getcredits";
  public SERVICE_PLAY:string = this.SERVICE + "resolveplay";
  public SERVICE_LOGIN:string = this.SERVICE + "login";

  private CREDITS = 0;

  private UID = "WEB";
  private PASS = "123";

  private _events: Events;
  constructor(public _http:Http, events:Events) {
    this._events = events;
  }
  public setUID(value) { this.UID = value; }
  public getUID() { return this.UID; }
  _/*public getCredits() {
    var body = new URLSearchParams("");
    body.set('user', this.UID);
    body.set('pass', this.PASS);

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this._http.post(this.SERVICE_LOGIN, body.toString(),{ headers:headers }).subscribe(res => this.processCredits(res), err => console.log(err));
  }
  public processCredits(res) {
    if (res.status == "ok") {
      if (res.credits) this.CREDITS = res.credits;
      else this.CREDITS = 0;
    } else this.CREDITS = 0;

    console.log("creditos actuales: " + this.CREDITS);
    this._events.publish('oncredits', this.CREDITS);
    return this.CREDITS;
  }*/
  public setCredits(value) {
    this.CREDITS = value;
    this._events.publish('oncredits', this.CREDITS);
  }
  public doVerifyCredits(ticket) {
    var body = new URLSearchParams("");
    body.set('user', this.UID);
    body.set('pass', this.PASS);
    body.set('ticket', ticket);

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this._http.post(this.SERVICE_TICKETS, body.toString(),{ headers:headers });
  }
  public doResolvePlay(data) {
    var body = new URLSearchParams(data);
    body.set('user', this.UID);
    body.set('pass', this.PASS);
    body.set('mano', data.mano);
    body.set('salido', data.salido);
    body.set('bets', data.bets);

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this._http.post(this.SERVICE_PLAY, body.toString(),{ headers:headers });
  }
  public doLogin() {
    var body = new URLSearchParams("");
    body.set('user', this.UID);
    body.set('pass', this.PASS);

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this._http.post(this.SERVICE_LOGIN, body.toString(),{ headers:headers });
  }
}
