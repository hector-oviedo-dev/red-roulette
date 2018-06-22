import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GamesRoulettePage } from '../../pages/games-roulette/games-roulette';
import { LoginPage } from '../../pages/login/login';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    //this.navCtrl.push(GamesRoulettePage);
    this.navCtrl.push(LoginPage);
  }

}
