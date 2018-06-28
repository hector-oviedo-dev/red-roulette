import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GamesRoulettePage } from '../../pages/games-roulette/games-roulette';
import { AddcreditsPage } from '../../pages/addcredits/addcredits';
import { SingletonProvider } from '../../providers/singleton/singleton';

/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  
  public STREAM_URL = "ws://red-stream.herokuapp.com/";
  //public STREAM_URL = "ws://ruletaayex.ddns.net:7777";
  //'ws://red-stream.herokuapp.com/';

  public IP = "10.10.2.137";
  public PORT = "8080";
  public LAN_VIDEO = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private singleton:SingletonProvider) {
    if (!this.LAN_VIDEO) this.singleton.STREAM_URL = this.STREAM_URL;
    else this.singleton.STREAM_URL = 'ws://' + this.IP + ':'+ this.PORT;
  }
  public onChange(e) {
    this.singleton.STREAM_URL = 'ws://' + this.IP + ':'+ this.PORT;
    console.log(this.singleton.STREAM_URL)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }
  public onToggleClick(e) {
    if (!this.LAN_VIDEO) this.singleton.STREAM_URL = this.STREAM_URL;
    else this.singleton.STREAM_URL = 'ws://' + this.IP + ':'+ this.PORT;
  }
  public onGameClick(e) {
    this.navCtrl.push(GamesRoulettePage);
  }
  public onTicketClick(e) {
    this.navCtrl.push(AddcreditsPage);
  }

}
