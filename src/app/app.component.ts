import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeAudio } from '@ionic-native/native-audio';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  public sounds = [
    "0",'assets/sounds/50_F.wav',
    "1",'assets/sounds/51_F.wav',
    "2",'assets/sounds/52_F.wav',
    "3",'assets/sounds/53_F.wav',
    "4",'assets/sounds/54_F.wav',
    "5",'assets/sounds/55_F.wav',
    "6",'assets/sounds/56_F.wav',
    "7",'assets/sounds/57_F.wav',
    "8",'assets/sounds/58_F.wav',
    "9",'assets/sounds/59_F.wav',
    "10",'assets/sounds/60_F.wav',
    "11",'assets/sounds/61_F.wav',
    "12",'assets/sounds/62_F.wav',
    "13",'assets/sounds/63_F.wav',
    "14",'assets/sounds/64_F.wav',
    "15",'assets/sounds/65_F.wav',
    "16",'assets/sounds/66_F.wav',
    "17",'assets/sounds/67_F.wav',
    "18",'assets/sounds/68_F.wav',
    "19",'assets/sounds/69_F.wav',
    "20",'assets/sounds/70_F.wav',
    "21",'assets/sounds/71_F.wav',
    "22",'assets/sounds/72_F.wav',
    "23",'assets/sounds/73_F.wav',
    "24",'assets/sounds/74_F.wav',
    "25",'assets/sounds/75_F.wav',
    "26",'assets/sounds/76_F.wav',
    "27",'assets/sounds/77_F.wav',
    "28",'assets/sounds/78_F.wav',
    "29",'assets/sounds/79_F.wav',
    "30",'assets/sounds/80_F.wav',
    "31",'assets/sounds/81_F.wav',
    "32",'assets/sounds/82_F.wav',
    "33",'assets/sounds/83_F.wav',
    "34",'assets/sounds/84_F.wav',
    "35",'assets/sounds/85_F.wav',
    "36",'assets/sounds/86_F.wav',
    "37",'assets/sounds/87_F.wav',

    "novamas",'assets/sounds/novamas.wav',
    "haganjuego",'assets/sounds/haganjuego.wav',
    "pago",'assets/sounds/pago.wav',
    "pagoend",'assets/sounds/pagoend.wav',
    "rastri",'assets/sounds/rastri.wav',
    "coinin",'assets/sounds/coinin.wav',

    "bet",'assets/sounds/bet.wav',
    "unbet",'assets/sounds/unbet.wav',
    "betmax",'assets/sounds/betmax.wav',

    "bet1",'assets/sounds/bet1.wav',
    "bet2",'assets/sounds/bet2.wav',
    "bet3",'assets/sounds/bet3.wav'
  ]
  public actual = 0;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private nativeAudio: NativeAudio) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.loadSound(this.sounds[0][0],this.sounds[0][1]);
    });
  }
  private loadSound(snd,path) {
    this.nativeAudio.preloadSimple(snd, path).then(() => {console.log("sound " + snd + " loaded successfully")},() => {
      if (this.actual < this.sounds.length) {
        this.actual++;
        this.loadSound(this.sounds[this.actual][0],this.sounds[this.actual][1]);
      }
    });
  }
}