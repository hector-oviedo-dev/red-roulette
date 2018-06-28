import { Component } from '@angular/core';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../../pages/home/home';
/**
 * Generated class for the AddcreditsresultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addcreditsresult',
  templateUrl: 'addcreditsresult.html',
})
export class AddcreditsresultPage {
  public SPINNER:boolean = true;

  public TICKET:string;
  public TXT_STATUS:string;
  constructor(public nav: NavController, public navParams: NavParams, private singleton:SingletonProvider) {
    this.TICKET = navParams.get("ticket");
  }

  ionViewDidLoad() {
    this.SPINNER = true;
    this.singleton.doVerifyCredits(this.TICKET).subscribe(resultTMP => { this.doResult(resultTMP) });
  }
 public doResult(res) {
   this.SPINNER = false;
   var result = JSON.parse(res._body);
   if (result.status == "ok") {
     this.TXT_STATUS = "Se cargaron " + result.ticketcredits + " en su cuenta de forma correcta. Su nuevo credito es de " + result.credits;
     this.singleton.setCredits(parseInt(result.credits));
   } else this.TXT_STATUS = "La transaccion no pudo llevarse a cabo: " + result.errorMessage;
 }
 public onConfirm() {
    this.nav.push(HomePage);
 }
}
