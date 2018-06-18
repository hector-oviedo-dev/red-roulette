import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { NativeAudio } from '@ionic-native/native-audio';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GamesRoulettePage } from '../pages/games-roulette/games-roulette';
import { SingletonProvider } from '../providers/singleton/singleton';
import { SocketlistenerProvider } from '../providers/socketlistener/socketlistener';

@NgModule({
  declarations: [
    MyApp,
    GamesRoulettePage,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GamesRoulettePage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeAudio,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SingletonProvider,
    SocketlistenerProvider
  ]
})
export class AppModule {}
