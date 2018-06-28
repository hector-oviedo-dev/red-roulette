import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GamesRoulettePage } from '../../pages/games-roulette/games-roulette';
import { SingletonProvider } from '../../providers/singleton/singleton';

import { FormBuilder, Validators, FormGroup } from '@angular/forms';

/**
 * Generated class for the SigninPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
  public submitAttempt = false;

  public RESULT = "";

  public DNI = "";

  public taken:boolean = false;

  public valid:boolean = false;

  public imgID = "";

  public IMGUR_ENDPOINT:string = "https://api.imgur.com/3/image";
  public IMGUR_CLIENT_ID:string = "6ee5b73b97d07fd";

  public AZURE_ENDPOINT:string = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0";
  public AZURE_API_KEY:string = "51bcb19efc1141f288e6174c9d2df63e";
  public AZURE_API_KEY_2:string = "24003185b5584c95b5fe386b5f819bdc";

  public image:string;

  public link:string;

  public myForm:FormGroup;

  private options:CameraOptions = {
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetWidth: 600,
        targetHeight: 600,
        saveToPhotoAlbum: false,
        allowEdit: false,
        sourceType: 0,
        correctOrientation: true,
        cameraDirection: 0
  };
  constructor(public navCtrl: NavController, public navParams: NavParams, public camera:Camera,private singleton:SingletonProvider, public formBuilder:FormBuilder) {
    this.myForm = formBuilder.group({
      lastName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      firstName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      birthDate: ['', Validators.compose([Validators.required])],
      DNI: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(8), Validators.required])],
      phone: [],
      email: [],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  public onCreateClick(e) {
    this.submitAttempt = true;
    
    if (this.myForm.valid) {
      this.DNI = this.myForm.controls['DNI'].value;
      this.createPhoto();
    }
  }
  public onGameClick(e) {
    this.navCtrl.push(GamesRoulettePage);
  }
  //////////////////
  /////////SIGN IN//
  public createPhoto():void {
    this.RESULT = "Intentando Acceder a la camara...";
    this.camera.getPicture(this.options).then((imageData) => {
      this.RESULT = "ENCODING";
      let base64Image:string = 'data:image/jpeg;base64,' + imageData;
      this.uploadCreatePhoto(base64Image);
      }, (e) => { this.RESULT = "Error al intentar acceder a la camara."; });
  }
  //open camara, and take photo
  public uploadCreatePhoto(image:string):void {
    image = image.substring(image.indexOf('base64,') + 'base64,'.length);

    let auth:string = `Client-ID ${this.IMGUR_CLIENT_ID}`;

    let body:FormData = new FormData();
    body.append('image', image);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.IMGUR_ENDPOINT, true);
    xhr.setRequestHeader("Authorization", auth);

    this.RESULT = "Cargando imagen...";
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.status == 200) {
          this.link = JSON.parse(xhr.response)['data']['link'];
          //this.saveCreatePhoto();
          this.analyzeCreatePhoto();
        } else if (xhr.status >= 400) this.RESULT = "Error al intentar subir/cargar la imagen";
      }
    }
    xhr.send(body);
  }/*
  //save photo to azure
  public saveCreatePhoto():void {
    this.RESULT = "Analizando imagen...";
    let serialize = (parameters:object) => Object.keys(parameters).map(key => key + '=' + parameters[key]).join('&');

    let faceParameters:object = { };

    let serializedFaceParameters = serialize(faceParameters);

    let body = JSON.stringify({ "url": this.link });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${this.AZURE_ENDPOINT}/facelists/my_list/persistedFaces?${serializedFaceParameters}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", this.AZURE_API_KEY);

    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.status == 200) this.analyzeSaveCreateResponse(JSON.parse(xhr.response));
        else if (xhr.status >= 400) this.RESULT = "AZURE error";
      }
    }
    xhr.send(body);
  }
  //save photo to azure callback
  public analyzeSaveCreateResponse(response:object):void {
    this.imgID = response['persistedFaceId'];
    this.analyzeCreatePhoto();
  }*/
  //detect age
  public analyzeCreatePhoto():void {
    this.RESULT = "Analizando imagen...";
    let serialize = (parameters:object) => Object.keys(parameters).map(key => key + '=' + parameters[key]).join('&');

    let faceParameters:object = {
      "returnFaceId": "true",
      "returnFaceLandmarks": "false",
      "returnFaceAttributes": "age,gender,smile",
    }

    let serializedFaceParameters = serialize(faceParameters);

    let body = JSON.stringify({ "url": this.link });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${this.AZURE_ENDPOINT}/detect?${serializedFaceParameters}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", this.AZURE_API_KEY);

    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.status == 200) this.analyzeCreateResponse(JSON.parse(xhr.response));
        else if (xhr.status >= 400) this.RESULT = "AZURE error";
      }
    }
    xhr.send(body);
  }
  //detect age callback
  public analyzeCreateResponse(response:object):void {
    this.RESULT = "Edad aproximada: " + parseInt(response[0]['faceAttributes']['age']).toString();
    this.imgID = response[0]['faceId'];
    if (parseInt(response[0]['faceAttributes']['age']) > 18) {
      this.RESULT = "Edad aproximada: " + parseInt(response[0]['faceAttributes']['age']).toString();
      this.singleton.doSignInImage(this.DNI,this.imgID).subscribe(res => { this.doVerifyCreateResponse(res); });
    } else this.RESULT = "Edad aproximada: " + parseInt(response[0]['faceAttributes']['age']).toString() + " No puede ingresar si no es mayor de edad";
  }
  public doVerifyCreateResponse(res) {
    var result = JSON.parse(res._body);
    if (result.status == "ok") this.RESULT = "Su cuenta fue creada exitosamente!";
    else {
      this.RESULT = result.errorMessage;
    }
  }
}
