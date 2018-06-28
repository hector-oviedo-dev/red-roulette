import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Events } from 'ionic-angular';
import { AddcreditsresultPage } from '../../pages/addcreditsresult/addcreditsresult';
import { Camera } from '@ionic-native/camera';

declare var qrcode:any;

/**
 * Generated class for the AddcreditsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addcredits',
  templateUrl: 'addcredits.html',
})
export class AddcreditsPage {
  public TXT_STATUS = "";
  public localized = [];
  constructor(public brScanner: BarcodeScanner, public nav: NavController, private singleton:SingletonProvider, public events: Events,public camera:Camera) {
    qrcode.callback = function(result) {
      if (result == "error decoding QR Code") this.TXT_STATUS = "Imagen invalida, verifique que sea una imagen QR valida.";
      else this.onSuccessScan(result);
    }.bind(this);
  }
  ionViewDidLoad() {
    this.TXT_STATUS = "";
  }
  public startScan() {
    this.TXT_STATUS = "";
    this.brScanner.scan().then(barcodeData => {
      this.onSuccessScan(barcodeData.text);
    }, (err) => {
      this.TXT_STATUS = "ERROR de SCAN, por favor verifique los permisos de su dispositivo.";
    });
  }
  public startBarcode() {
    this.TXT_STATUS = "";
    this.camera.getPicture({
         sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
         destinationType: this.camera.DestinationType.FILE_URI
        }).then((imageData) => {
          this.TXT_STATUS = "Cargando Imagen";
          qrcode.decode(imageData);
        }, (err) => { this.TXT_STATUS = err; });
  }
   public onSuccessScan(result) {
     let data = { "ticket": result }
     this.nav.push(AddcreditsresultPage, data);
   }
}
