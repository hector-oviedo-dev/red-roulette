import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GamesRoulettePage } from '../../pages/games-roulette/games-roulette';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    this.navCtrl.push(GamesRoulettePage);
  }

}
