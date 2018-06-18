import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GamesRoulettePage } from './games-roulette';

@NgModule({
  declarations: [
    GamesRoulettePage,
  ],
  imports: [
    IonicPageModule.forChild(GamesRoulettePage),
  ],
})
export class GamesRoulettePageModule {}
