import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GamesRoulettePage } from '../../pages/games-roulette/games-roulette';
import { LoginPage } from '../../pages/login/login';
import { SigninPage } from '../../pages/signin/signin';
import { MenuPage } from '../../pages/menu/menu';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { PowerManagement } from '@ionic-native/power-management';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private singleton:SingletonProvider, private powerManagement: PowerManagement) {
    //this.singleton.STREAM_URL = "ws://10.10.2.137:8080";
    //this.singleton.STREAM_URL = 'ws://red-stream.herokuapp.com/';
    //this.navCtrl.push(GamesRoulettePage);
    //this.navCtrl.push(LoginPage);
    this.powerManagement.acquire().then(this.onSuccess).catch(this.onError);
  }
  public onSuccess(e) {

  }
  public onError(e) {

  }
  public onLogin() {
    this.navCtrl.push(LoginPage);
  }
  public onSignin() {
    this.navCtrl.push(SigninPage);
  }
  public onGo() {
    this.singleton.setUID("66777666");
    this.navCtrl.push(MenuPage);
  }

}
