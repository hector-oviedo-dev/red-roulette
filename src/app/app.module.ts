import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { NativeAudio } from '@ionic-native/native-audio';
import { Camera } from '@ionic-native/camera';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { PowerManagement } from '@ionic-native/power-management';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GamesRoulettePage } from '../pages/games-roulette/games-roulette';
import { LoginPage } from '../pages/login/login';
import { SigninPage } from '../pages/signin/signin';
import { AddcreditsPage } from '../pages/addcredits/addcredits';
import { AddcreditsresultPage } from '../pages/addcreditsresult/addcreditsresult';
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
    AddcreditsPage,
    AddcreditsresultPage,
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
    AddcreditsPage,
    AddcreditsresultPage,
    MenuPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeAudio,
    Camera,
    BarcodeScanner,
    PowerManagement,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SingletonProvider,
    SocketlistenerProvider
  ]
})
export class AppModule {}
