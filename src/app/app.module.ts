import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PowerManagement } from '@ionic-native/power-management';
import { StatusBar } from '@ionic-native/status-bar';

import { NativeAudio } from '@ionic-native/native-audio';
import { Camera } from '@ionic-native/camera';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GamesRoulettePage } from '../pages/games-roulette/games-roulette';
import { LoginPage } from '../pages/login/login';
import { SigninPage } from '../pages/signin/signin';
import { MenuPage } from '../pages/menu/menu';
import { SingletonProvider } from '../providers/singleton/singleton';
import { SocketlistenerProvider } from '../providers/socketlistener/socketlistener';

import { FormsModule, FormGroup, FormControl,ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MyApp,
    GamesRoulettePage,
    LoginPage,
    SigninPage,
    MenuPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GamesRoulettePage,
    LoginPage,
    SigninPage,
    MenuPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeAudio,
    Camera,
    PowerManagement,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SingletonProvider,
    SocketlistenerProvider
  ]
})
export class AppModule {}
