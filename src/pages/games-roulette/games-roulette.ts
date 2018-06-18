import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Scroll, NavController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { SocketlistenerProvider } from '../../providers/socketlistener/socketlistener';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Events } from 'ionic-angular';

import { HomePage } from '../home/home';

declare var JSMpeg:any;

@Component({
  selector: 'page-games-roulette',
  templateUrl: 'games-roulette.html'
})

export class GamesRoulettePage {
    @ViewChild("media") canvasVideo:ElementRef;

    @ViewChild("mediaCanvas") mediaCanvas:ElementRef;

    @ViewChild("canvas") canvas:ElementRef;

    @ViewChild("scrollContainer") scrollContainer:Scroll;

    @ViewChild("btnsContainer") btnsContainer:ElementRef;
    @ViewChild("btnBet") btnBet:ElementRef;
    @ViewChild("btnUnbet") btnUnbet:ElementRef;
    @ViewChild("btnClearbet") btnClearbet:ElementRef;

    @ViewChild("btnBetModuleCanvas") btnBetModuleCanvas:ElementRef;

    @ViewChild("numberContainer") numberContainer:ElementRef;
    public btnBetModuleContext:CanvasRenderingContext2D;

    public context:CanvasRenderingContext2D;

    public scale = 1;

    public REMOVE_MODE = false;
    public BET_MODULES = [1,5,10,0];
    public BET_MODULE_ACTUAL = 0;
    public BET_MODULE = 1;

    public playing = false;
    public repiting = false;
    public xTMP = 0;
    public yTMP = 0;

    public FRAMERATE = 30;
    public repeating_delay = 20;
    public repeating_bet = 18;
    public repeating_number = 0;

    public LAST_BET = 0;
    public BET_GRID = [];

    public COBRA = 0;

    public CREDITS = 0;

    public CREDITS_TMP = this.CREDITS;

    public ACTUAL_STATE = "";
    public ACTUAL_TIME = 0;
    public ACTUAL_MANO;
    public ACTUAL_RESULT;

    public RESULT_HIDDEN = true;

    public STATE_RESULT = false;
    public STATE_HAGANJUEGO = false;
    public STATE_NOVAMAS = false;
    public STATE_PAYMENT = false;

    public PAYMENT_ANIMATION = false;
    public PAYMENT_BETS = [];

    public url;
    public player;

    public SPINNER = true;
    constructor(private service:SocketlistenerProvider, public events: Events, private renderer : Renderer, private nav:NavController, private singleton:SingletonProvider,private nativeAudio: NativeAudio) {

     }
     public onCredits(msg) {
       this.CREDITS = msg;
     }
    ionViewDidLoad() {
      this.SPINNER = true;

      this.events.subscribe('oncredits', (msg) => {
         this.onCredits(msg);
       });
      this.events.subscribe('onmessage', (msg) => {
        this.onMessage(msg);
       });

      this.singleton.doLogin().subscribe(res => { this.onLoginSuccess(res); });
    }
    //on login
    public onLoginSuccess(res) {
      var result = JSON.parse(res._body);
      if (result.status == "ok") {

        //set credits
        this.singleton.setCredits(parseInt(result.credits));

        //set up and play video
        let canvas = this.mediaCanvas.nativeElement;
        this.url = 'ws://red-stream.herokuapp.com/';
        this.player = new JSMpeg.Player(this.url, {canvas: canvas,progressive:true,chunkSize:0,videoBufferSize:0});

        //websocket (roulette server)
        this.service.connect();

      } else this.nav.push(HomePage);
    }
    ngOnInit() {
      this.context = this.canvas.nativeElement.getContext("2d");

      this.doPlenos();
      this.doSHPlenos();
      this.doSVPlenos();
      this.doQPlenos();
      this.doTPlenos();
      this.doSPlenos();

      this.doFChance();
      this.doDChance();
      this.doChance();

      this.doDrawLayout();

      setInterval(()=> { this.enterFrame(); }, this.FRAMERATE);
    }
    public scrollHandler(e) {
      //console.log("scrolling" + e);
    }
    public onBackClick() {
      if (!this.BLOCKING) {
        this.events.unsubscribe('oncredits');
        this.events.unsubscribe('onmessage');
        this.service.disconnect();

        this.clearBet();

        this.player.stop();
        this.player.destroy();

        this.nav.push(HomePage);
      }
    }
    public enterFrame() {
     if (this.ACTUAL_MANO != undefined) this.SPINNER = false;
     else {
       this.SPINNER = true;
       return;
     }
      var rect = this.canvas.nativeElement.getBoundingClientRect();

      this.VAR_BTN_BET_X = this.btnBet.nativeElement.offsetLeft - rect.left;
      this.VAR_BTN_BET_Y = this.btnsContainer.nativeElement.offsetTop - rect.top;

      this.VAR_BTN_UNBET_X = this.btnUnbet.nativeElement.offsetLeft - rect.left;
      this.VAR_BTN_UNBET_Y = this.btnsContainer.nativeElement.offsetTop - rect.top;

      this.VAR_BTN_CLEAR_X = this.btnClearbet.nativeElement.offsetLeft - rect.left;
      this.VAR_BTN_CLEAR_Y = this.btnsContainer.nativeElement.offsetTop - rect.top;

      if (this.playing) {
        if (this.repeating_number < this.repeating_delay) this.repeating_number++;
        this.bet();
      }

      let totalBet = 0;
      for (var i = 0; i < this.BET_GRID.length; i++)  totalBet += this.BET_GRID[i].bet;
      this.CREDITS_TMP = this.CREDITS - totalBet;
    }
     ///////////////////////////////////////////
     //Parser de WebSocket (estados de ruleta)//
     ///////////////////////////////////////////
     private onMessage(msg:string) {
       console.log(msg)
       if (msg == "ping" || this.PAYMENT_ANIMATION || msg == "onwsconnect" || msg == "onwsdisconnect" || !msg || msg == "" || msg == "undefined" || msg == "null" || msg == null) return;

       let result = JSON.parse(msg);

       if (result.SJ) {
         if (result.R <= 37) {
           if (this.STATE_RESULT) return;
           this.STATE_HAGANJUEGO = false;
           this.STATE_NOVAMAS = false;
           this.STATE_RESULT = true;
           this.STATE_PAYMENT = false;

           this.BLOCKING = true;
           this.ACTUAL_TIME = 0;
           this.ACTUAL_STATE = "NUMERO SALIDO: ";

           if (result.R == 37) this.ACTUAL_RESULT = "00";
           else this.ACTUAL_RESULT = result.R;

           this.ACTUAL_MANO = result.M;
           this.RESULT_HIDDEN = false;

           this.processResult();

           this.processVideoPopup();
         } else {
           this.RESULT_HIDDEN = true;

          switch (result.SJ) {
            case 1:
              this.ACTUAL_TIME = result.T;
              this.ACTUAL_MANO = result.M;

              if (this.STATE_HAGANJUEGO) return;
              this.STATE_HAGANJUEGO = true;
              this.STATE_NOVAMAS = false;
              this.STATE_RESULT = false;
              this.STATE_PAYMENT = false;

              this.ACTUAL_STATE = "";

              this.BLOCKING = false;
              this.VIDEO_SHOWING = false;

              this.COBRA = 0;
              this.processVideoPopup();
            break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
              this.BLOCKING = true;
              this.ACTUAL_TIME = 0;
              this.ACTUAL_STATE = "ERROR EN RULETA";
              this.ACTUAL_MANO = result.M;

              this.STATE_HAGANJUEGO = false;
              this.STATE_NOVAMAS = false;
              this.STATE_RESULT = false;
              this.STATE_PAYMENT = false;
              break;
            case 2:
              if (this.STATE_NOVAMAS) return;
              this.STATE_HAGANJUEGO = false;
              this.STATE_NOVAMAS = true;
              this.STATE_RESULT = false;
              this.STATE_PAYMENT = false;

              this.BLOCKING = true;
              this.ACTUAL_TIME = 0;
              this.ACTUAL_STATE = "NO VA MAS";
              this.ACTUAL_MANO = result.M;

              this.nativeAudio.play('novamas', () => console.log('novamas sound end'));
            break;
            case 3:
            case 4:
            if (this.STATE_PAYMENT) return;
            this.STATE_PAYMENT = true;

            this.BLOCKING = true;
            this.ACTUAL_TIME = 0;
            this.ACTUAL_STATE = "PAGANDO";

            this.STATE_HAGANJUEGO = false;
            this.STATE_NOVAMAS = false;
            this.STATE_RESULT = false;
            this.STATE_PAYMENT = true;

            this.doProcessService();
            break;
            case 5:
            break;
          }
        }
        if (result.SJ != 1) {
          this.playing = false;
          this.LAST_BET = null;

          if  (!this.PAYMENT_ANIMATION) this.VIDEO_SHOWING = true;
          this.processVideoPopup();
        }
       }
     }
     //////////////////////
     //Llega el resultado//
     //////////////////////
     private processResult() {
       switch (this.ACTUAL_RESULT) {
         case 0:
         case "00":
         this.renderer.setElementStyle(this.numberContainer.nativeElement, 'background-color', "#5dce75");
         break;
         case 1:
         case 3:
         case 5:
         case 9:
         case 7:
         case 12:
         case 14:
         case 16:
         case 18:
         case 19:
         case 21:
         case 23:
         case 25:
         case 27:
         case 30:
         case 32:
         case 34:
         case 36:
         this.renderer.setElementStyle(this.numberContainer.nativeElement, 'background-color', "#a93121");
         break;
         default:
         this.renderer.setElementStyle(this.numberContainer.nativeElement, 'background-color', "black");
       }
       this.nativeAudio.play(this.ACTUAL_RESULT.toString(), () => console.log('number sound end'));
   }
   ///////////////////////////
   //Consulto Pago de Jugada//
   ///////////////////////////
    public doProcessService() {
      let betting = false;

      this.PAYMENT_BETS = [];

      for (let i = 0; i < this.BET_GRID.length;i++) {
        if (this.BET_GRID[i].bet > 0) {
          betting = true;
          let bet = {
            "bet":this.BET_GRID[i].bet,
            "multiplier":this.BET_GRID[i].multiplier,
            "zone":this.BET_GRID[i].zone
          }
          this.PAYMENT_BETS.push(bet);
        }
      }

      let salido = this.ACTUAL_RESULT;
      if (salido == "00") salido = 37;

      if (betting) {
        this.PAYMENT_ANIMATION = true;

        this.RESULT_HIDDEN = true;

        this.STATE_HAGANJUEGO = false;
        this.STATE_NOVAMAS = false;
        this.STATE_RESULT = false;
        this.STATE_PAYMENT = false;

        this.ACTUAL_STATE = "";

        this.BLOCKING = false;
        this.VIDEO_SHOWING = false;
        this.VIDEO_POPUP = false;

        let data = {
          "mano":this.ACTUAL_MANO,
          "salido":salido,
          "bets":JSON.stringify(this.PAYMENT_BETS)
        };

        console.log(JSON.stringify(this.PAYMENT_BETS));

        this.singleton.doResolvePlay(data).subscribe(res => { this.onServiceResult(res); });
      } else {
        this.nativeAudio.play('haganjuego', () => console.log('hagan juego sound end'));
       }
    }
    public onServiceResult(res) {
      console.log("respuesta: " + res._body);

      var result = JSON.parse(res._body);
      if (result.status == "ok") {
        this.singleton.setCredits(result.credits);
        this.CREDITS = result.credits;

        if (result.win > 0) {
          this.COBRA = result.win;

          this.PaymentAnimation();
        } else {
          this.clearBet();
          this.PAYMENT_ANIMATION = false;
          this.nativeAudio.play('rastri', () => console.log('rastri sound end'));
        }
      } else {
        this.clearBet();
        this.nav.push(HomePage);
      }
    }
    //////////////////////
    //Animacion De pagos//
    //////////////////////

    public PaymentAnimation() {
      let salido = this.ACTUAL_RESULT;
      if (salido == "00") salido = 37;

      let clearBets = false;
      for (var i = 0; i < this.BET_GRID.length; i++) {
          let validZone = false;
      		let zone =  this.BET_GRID[i].zone;

      		for (var j = 0; j < zone.length; j++) if (zone[j] == salido) validZone = true;

          if (!validZone) {
            clearBets = true;

            this.BET_GRID[i].bet = 0;

            let data = this.BET_GRID[i].data;
            if (this.BET_GRID[i].drawed) {
              this.BET_GRID[i].drawed = false;
              this.context.drawImage(this.bgIMG,data.sx,data.sy,data.swidth,data.sheight,data.sx,data.sy,data.swidth,data.sheight)
            }
          }
      	}
        if (clearBets) this.nativeAudio.play('rastri', () => console.log('rastri sound end'));
        setTimeout(function(this) { this.animLoop(); }.bind(this), 500);
    }
    public animLoop() {
      let salido = this.ACTUAL_RESULT;
      if (salido == "00") salido = 37;

      let paying = false;
      for (var i = 0; i < this.BET_GRID.length; i++) {


          let data = this.BET_GRID[i].data;

          if (this.BET_GRID[i].bet > 0) {
            this.BET_GRID[i].bet = this.BET_GRID[i].bet -1;

            if (!this.BET_GRID[i].drawed) {
              this.BET_GRID[i].drawed = true;

              this.doDrawChip(data,this.BET_GRID[i]);
            } else {
            let data = this.BET_GRID[i].data;
            if (this.BET_GRID[i].drawed) {
              this.BET_GRID[i].drawed = false;
              this.context.drawImage(this.bgIMG,data.sx,data.sy,data.swidth,data.sheight,data.sx,data.sy,data.swidth,data.sheight)
            }
          }
            this.doNumbers(this.BET_GRID[i]);

            paying = true;
          } else {
            this.BET_GRID[i].drawed = false;
            this.context.drawImage(this.bgIMG,data.sx,data.sy,data.swidth,data.sheight,data.sx,data.sy,data.swidth,data.sheight)
          }

      }
      this.nativeAudio.play('pago', () => console.log('pago sound end'));
      if (paying) setTimeout(function(this) { this.animLoop(); }.bind(this), 50);
      else setTimeout(function(this) { this.paymentEnd(); }.bind(this), 50);
    }

    public paymentEnd() {
      this.PAYMENT_ANIMATION = false;

      this.clearBet();
      this.nativeAudio.play('pagoend', () => this.nativeAudio.play('haganjuego', () => console.log('hagan juego sound end')));
    }

    //Video Streaming

    @ViewChild("media") videoPlayer:ElementRef;
    public BLOCKING = false;
    public VIDEO_SHOWING = false;
    public VIDEO_POPUP = false;

    public videoClick() {
      if (this.BLOCKING) return;

      if (this.VIDEO_SHOWING) this.VIDEO_SHOWING = false;
      else this.VIDEO_SHOWING = true;

      this.processVideoPopup();
    }
    public processVideoPopup() {
      if (!this.BLOCKING) {
        if (this.VIDEO_SHOWING) this.VIDEO_POPUP = true;
        else this.VIDEO_POPUP = false;
      } else this.VIDEO_POPUP = true;
    }

    //Popup contenedor de menu derecho

    @ViewChild("creditsContainer") CreditsPopup:ElementRef;

    public CREDITS_POPUP = true;
    public moveCreditsPopup() {
      if (this.CREDITS_POPUP) {
        this.renderer.setElementStyle(this.CreditsPopup.nativeElement, 'right', "-171px");
        this.CREDITS_POPUP = false;
      } else {
        this.renderer.setElementStyle(this.CreditsPopup.nativeElement, 'right', "0px");
        this.CREDITS_POPUP = true;
      }
    }
    ////////////////////////////////////
    //Listeners De Eventos Touch/Mouse//
    ////////////////////////////////////

    public onTouchDown(e:TouchEvent) {
      this.repeating_number = 0;

      var rect = this.canvas.nativeElement.getBoundingClientRect();

      this.xTMP = (e.touches[0].clientX - rect.left) / this.scale;
      this.yTMP = (e.touches[0].clientY - rect.top) / this.scale;

      let touches = e.touches || [e],touch;
      let incs = 0;
      for (let i = 0, l = touches.length; i < l; i++) incs++;
      if (incs == 1) {
        this.playing = false;

        this.scrollContainer._scrollX = true;
        this.scrollContainer._scrollY = true;

      } else {
        this.scrollContainer._scrollX = false;
        this.scrollContainer._scrollY = false;

        ///BOTONES
        if (this.checkGrid(this.xTMP,this.yTMP,this.VAR_BTN_UNBET_X,this.VAR_BTN_UNBET_Y,this.VAR_BTN_WIDTH,this.VAR_BTN_HEIGHT)){
          this.playing = true;
          this.REMOVE_MODE = true;
          this.xTMP = (e.touches[1].clientX - rect.left) / this.scale;
          this.yTMP = (e.touches[1].clientY - rect.top) / this.scale;
          this.bet();
        }
        else if (this.checkGrid(this.xTMP,this.yTMP,this.VAR_BTN_BET_X,this.VAR_BTN_BET_Y,this.VAR_BTN_WIDTH,this.VAR_BTN_HEIGHT)) {
          this.playing = true;
          this.REMOVE_MODE = false;
          this.xTMP = (e.touches[1].clientX - rect.left) / this.scale;
          this.yTMP = (e.touches[1].clientY - rect.top) / this.scale;
          this.bet();
        }
      }
    }
    public onTouchUp(e:TouchEvent) {
      this.playing = false;
      this.LAST_BET = null;
    }

    public onTouchMove(e:TouchEvent) {
      var rect = this.canvas.nativeElement.getBoundingClientRect();

      let touches = e.touches || [e],touch;
      let incs = 0;
      for (let i = 0, l = touches.length; i < l; i++) incs++;
      if (incs == 1) {
        this.xTMP = (e.touches[0].clientX - rect.left) / this.scale;
        this.yTMP = (e.touches[0].clientY - rect.top) / this.scale;
      } else {
        this.xTMP = (e.touches[1].clientX - rect.left) / this.scale;
        this.yTMP = (e.touches[1].clientY - rect.top) / this.scale;
      }
    }
    public onMouseDown(e:MouseEvent) {
      this.repeating_number = 0;
      var rect = this.canvas.nativeElement.getBoundingClientRect();

      this.xTMP = (e.clientX - rect.left) / this.scale;
      this.yTMP = (e.clientY - rect.top) / this.scale;
      this.playing = true;

      //if (this.checkGrid(this.xTMP,this.yTMP,this.REMOVE_ALL_X,this.REMOVE_ALL_Y,48,48)) this.clearBet();
      //else if (this.checkGrid(this.xTMP,this.yTMP,this.REMOVE_X,this.REMOVE_Y,48,48)) this.removeBet();
      this.bet();
    }
    public onMouseUp(e:MouseEvent) {
      this.playing = false;
      this.LAST_BET = null;
    }
    public onMouseMove(e:MouseEvent) {
      var rect = this.canvas.nativeElement.getBoundingClientRect();

      this.xTMP = (e.clientX - rect.left) / this.scale;
      this.yTMP = (e.clientY - rect.top) / this.scale;
    }

    //////////////////////
    //Metodos de apuesta//
    //////////////////////
    public changeModule(add = true) {
      if (add) this.BET_MODULE_ACTUAL++;
      if (this.BET_MODULE_ACTUAL >= this.BET_MODULES.length) this.BET_MODULE_ACTUAL = 0;

      this.BET_MODULE = this.BET_MODULES[this.BET_MODULE_ACTUAL];

      this.btnBetModuleContext.drawImage(this.imgCHIP,
        this.VAR_CHIP_WIDTH * this.BET_MODULE_ACTUAL,
        0,
        this.VAR_CHIP_WIDTH,
        this.VAR_CHIP_HEIGHT,
        11.5,
        11.5,
        this.VAR_CHIP_WIDTH,
        this.VAR_CHIP_HEIGHT);


        let fontIMG = this.getImage(this.VAR_FONT.src);

        if (this.BET_MODULE != 0) {
          if (this.BET_MODULE < 10) this.doDrawNumberModule(fontIMG,15,this.BET_MODULE);
          else {
           let numbs = (""+this.BET_MODULE).split("");

           this.doDrawNumberModule(fontIMG,9,parseInt(numbs[0]));
           this.doDrawNumberModule(fontIMG,20,parseInt(numbs[1]));
          }
        }

        switch (this.BET_MODULE_ACTUAL) {
          case 0:
            this.nativeAudio.play('bet1', () => console.log('bet module sound end'));
            break;
          case 1:
            this.nativeAudio.play('bet2', () => console.log('bet module sound end'));
            break;
          case 2:
            this.nativeAudio.play('bet3', () => console.log('bet module sound end'));
            break;
          case 3:
            this.nativeAudio.play('betmax', () => console.log('bet module sound end'));
            break;
        }
    }
    public bet() {
      if (this.scrollContainer._scrollX || !this.STATE_HAGANJUEGO || this.PAYMENT_ANIMATION) return;

      for (var i = 0; i < this.BET_GRID.length; i++) {

        if (this.checkGrid(this.xTMP,this.yTMP,this.BET_GRID[i].var_x, this.BET_GRID[i].var_y,this.BET_GRID[i].var_width,this.BET_GRID[i].var_height)) {
          if (i != this.LAST_BET) this.repeating_number = 0;

          if (!this.REMOVE_MODE) {
            if (this.checkCredits(this.BET_GRID[i])) {
              let data = this.BET_GRID[i].data;
              if (this.checkBet(this.BET_GRID[i])) {
                if (this.BET_GRID[i].bet == 0) {
                  if (this.BET_MODULE == 0) this.BET_GRID[i].bet = this.BET_GRID[i].var_max;
                  else this.BET_GRID[i].bet = this.BET_MODULE;
                  this.repeating_number = 0;
                } else {
                  if (this.repeating_number >= this.repeating_delay || i != this.LAST_BET) {
                    if (this.BET_MODULE == 0) this.BET_GRID[i].bet = this.BET_GRID[i].var_max;
                    else this.BET_GRID[i].bet = parseInt(this.BET_GRID[i].bet) + this.BET_MODULE;
                    this.repeating_number = this.repeating_bet;
                  }
                }
              } else {
                if (this.repeating_number >= this.repeating_delay || i != this.LAST_BET) {
                  this.BET_GRID[i].bet = parseInt(this.BET_GRID[i].var_max);
                  this.repeating_number = this.repeating_bet;
                }
              }
              if (!this.BET_GRID[i].drawed) {
                this.BET_GRID[i].drawed = true;

                this.doDrawChip(data,this.BET_GRID[i]);
              }
              this.doNumbers(this.BET_GRID[i]);
              this.nativeAudio.play('bet', () => console.log('bet sound end'));
            }
          } else {
            if (this.repeating_number >= this.repeating_delay || i != this.LAST_BET) {
              this.repeating_number = this.repeating_bet;
              if (this.BET_GRID[i].bet > 0 && this.BET_MODULE != 0) this.BET_GRID[i].bet = this.BET_GRID[i].bet - this.BET_MODULE;
              if (this.BET_GRID[i].bet <= 0 || this.BET_MODULE == 0) {
                this.BET_GRID[i].bet = 0;
                if (this.BET_GRID[i].drawed) {
                  let data = this.BET_GRID[i].data;
                  this.BET_GRID[i].drawed = false;
                  this.context.drawImage(this.bgIMG,data.sx,data.sy,data.swidth,data.sheight,data.sx,data.sy,data.swidth,data.sheight)
                }
              } else {
                let data = this.BET_GRID[i].data;
                if (!this.BET_GRID[i].drawed) {
                  this.BET_GRID[i].drawed = true;
                  this.doDrawChip(data,this.BET_GRID[i]);
                }
                this.doNumbers(this.BET_GRID[i]);
                this.nativeAudio.play('unbet', () => console.log('bet sound end'));
              }
            }
          }
          if (i != this.LAST_BET) this.repeating_number = 0;
          this.LAST_BET = i;
        }
      }
    }
    public clearBet() {
      for (var i = 0; i < this.BET_GRID.length; i++) {
          this.BET_GRID[i].bet = 0;
          let data = this.BET_GRID[i].data;
          if (this.BET_GRID[i].drawed) {
            this.BET_GRID[i].drawed = false;
            this.context.drawImage(this.bgIMG,data.sx,data.sy,data.swidth,data.sheight,data.sx,data.sy,data.swidth,data.sheight)
          }
      }
    }
    public checkGrid(xTMP,yTMP, xPOS, yPOS, widthTMP, heightTMP) {

      if (xTMP > xPOS && xTMP < (xPOS + widthTMP) && yTMP > yPOS && yTMP < (yPOS + heightTMP)) return true;
      else return false;

    }
    public checkBet(obj) {
      let result = true;

      let bet = obj.bet + this.BET_MODULE;

      if (bet > obj.var_max) result = false;

      return result;
    }
    public checkCredits(obj) {
      let result = false;

      let totalBet = 0;
      for (var i = 0; i < this.BET_GRID.length; i++)  totalBet += this.BET_GRID[i].bet;

      let betTMP = obj.bet + this.BET_MODULE;
      if (betTMP > obj.var_max) betTMP = obj.var_max;

      if (totalBet + this.BET_MODULE <= this.CREDITS) result = true;

      return result;
    }

    //Variables de posiciones e imagenes

    public bgIMG;
    public imgCHIP;
    public imgCHIP2;
    public imgFONT;

    public VAR_BTN_BET_X = 0;
    public VAR_BTN_BET_Y = 0;

    public VAR_BTN_UNBET_X = 0;
    public VAR_BTN_UNBET_Y = 0;

    public VAR_BTN_CLEAR_X = 0;
    public VAR_BTN_CLEAR_Y = 0;

    public VAR_BTN_WIDTH = 68;
    public VAR_BTN_HEIGHT = 66;

    public VAR_OFFSET_X = 0;
    public VAR_OFFSET_Y = 0;

    public VAR_CHIP_TXT_WIDTH = 14.85;
    public VAR_CHIP_TXT_HEIGHT = 17;

    public VAR_CHIP_WIDTH = 44.3;
    public VAR_CHIP_HEIGHT = 50;

    public VAR_CHIP2_WIDTH = 71;
    public VAR_CHIP2_HEIGHT = 41;

    public VAR_VALUES = [1,5,10];

    public VAR_FONT = {
      src:"assets/images/chipfont.png",
      var_width:this.VAR_CHIP_TXT_WIDTH,
      var_height:this.VAR_CHIP_TXT_HEIGHT,
      var_y:16,
      var_x_c:10,
      var_y_c:13
    }

    ///////////////////////////////
    //Metodos de dibujo de canvas//
    ///////////////////////////////
    public doDrawLayout() {
      this.bgIMG = new Image();
      this.bgIMG.src = "assets/images/bg.png";

      this.bgIMG.onload = () =>  {
        this.context.drawImage(this.bgIMG,0,0);

        this.imgCHIP = new Image();
        this.imgCHIP.src = "assets/images/chip.png";

        this.imgCHIP.onload = () =>  {
          this.imgCHIP2 = new Image();
          this.imgCHIP2.src = "assets/images/chip2.png";

          this.imgCHIP2.onload = () =>  {
            this.imgFONT = new Image();
            this.imgFONT.src = "assets/images/chipfont.png";

            this.imgFONT.onload = () => {

              ///BTN MODULO
             this.btnBetModuleContext = this.btnBetModuleCanvas.nativeElement.getContext("2d");
             let btnimg = new Image();
             btnimg.src = "assets/images/btnbetmodule.png";
             btnimg.onload = () =>  {
               this.btnBetModuleContext.drawImage(btnimg,0,0);
               this.changeModule(false);
             }
             ///BTN MODULO

              this.doLoadNext();
            }
          }
        }
      }
    }
    public doLoadNext() {
      let loads = true;
      for (var i = 0; i < this.BET_GRID.length; i++) {

        if (!this.BET_GRID[i].loaded) {
          loads = false;

          let img = this.getImage(this.BET_GRID[i].src);

             let betTMP = this.BET_GRID[i];

             let dx = 0;
             let dy = 0;
             let dwidth = betTMP.var_width;
             let dheight = betTMP.var_height;
             let sx = betTMP.var_x;
             let sy = betTMP.var_y;
             let swidth = betTMP.var_width;
             let sheight = betTMP.var_height;

             this.BET_GRID[i].data = this.doIMGData(img,dx,dy,dwidth,dheight,sx,sy,swidth,sheight);

             this.BET_GRID[i].loaded = true;

             this.doLoadNext();

          i = this.BET_GRID.length;
        }
      }
    }
    public getImage(src) {
      let result;
      switch (src) {
        case "assets/images/chip.png":
        result = this.imgCHIP;
        break;
        case "assets/images/chip2.png":
        result = this.imgCHIP2;
        break;
        case "assets/images/chipfont.png":
        result = this.imgFONT;
        break;
      }
      return result;
    }
    public doDrawChip(data,obj) {
      //let tmp = obj.var_max / 4;
      let offset = 0;

      if (obj.bet == obj.var_max) offset = 3;
      else {
        if (obj.bet >= this.VAR_VALUES[2] && obj.bet < obj.var_max) offset = 2;
        else if (obj.bet >= this.VAR_VALUES[1] && obj.bet <= this.VAR_VALUES[2]) offset = 1;
        else offset = 0;
      }

      this.context.drawImage(data.img,
        data.dx + data.swidth * offset,
        data.dy,
        data.dwidth,
        data.dheight,
        data.sx,
        data.sy,
        data.swidth,
        data.sheight);
    }
    public doIMGData(img,dx,dy,dwidth,dheight,sx,sy,swidth,sheight) {
      return {
        img:img,
        dx:dx,
        dy:dy,
        dwidth:dwidth,
        dheight:dheight,
        sx:sx,
        sy:sy,
        swidth:swidth,
        sheight:sheight
      }
    }

    public doNumbers(obj) {
      let fontIMG = this.getImage(this.VAR_FONT.src);

      if (obj.bet < 10)  this.doDrawNumber(fontIMG,obj,15,obj.bet,true);
     else if (obj.bet > 9 && obj.bet < 100) {
       let numbs = (""+obj.bet).split("");

       this.doDrawNumber(fontIMG,obj,9,parseInt(numbs[0]),true);
       this.doDrawNumber(fontIMG,obj,20,parseInt(numbs[1]));
     } else {
       let numbs = (""+obj.bet).split("");

       this.doDrawNumber(fontIMG,obj,3,parseInt(numbs[0]),true);
       this.doDrawNumber(fontIMG,obj,17,parseInt(numbs[1]));
       this.doDrawNumber(fontIMG,obj,32,parseInt(numbs[2]));
     }
    }
    public doDrawNumber(fontIMG,obj,xoffset,numb,clear = false) {

      if (clear) {
        this.context.drawImage(this.bgIMG,obj.data.sx,obj.data.sy,obj.data.swidth,obj.data.sheight,obj.data.sx,obj.data.sy,obj.data.swidth,obj.data.sheight)

      this.doDrawChip(obj.data,obj);
      }

      let yoffset = this.VAR_FONT.var_y;

      if (obj.type == this.VAR_CHANCE.type || obj.type == this.VAR_D_CHANCE.type || obj.type == this.VAR_F_CHANCE.type) {
       yoffset = this.VAR_FONT.var_y_c;
       xoffset = xoffset + this.VAR_FONT.var_x_c;
      }

      let number = this.doIMGData(fontIMG,
        this.VAR_FONT.var_width * numb,
        0,
        this.VAR_FONT.var_width,
        this.VAR_FONT.var_height,
        obj.data.sx + xoffset,
        obj.data.sy + yoffset,
        this.VAR_FONT.var_width,
        this.VAR_FONT.var_height);


        this.context.drawImage(number.img,
          number.dx,
          number.dy,
          number.dwidth,
          number.dheight,
          number.sx,
          number.sy,
          number.swidth,
          number.sheight);
    }
    public doDrawNumberModule(fontIMG,xoffset,numb) {
      let yoffset = this.VAR_FONT.var_y;

      let number = this.doIMGData(fontIMG,
        this.VAR_FONT.var_width * numb,
        0,
        this.VAR_FONT.var_width,
        this.VAR_FONT.var_height,
        11.5 + xoffset,
        11.5 + yoffset,
        this.VAR_FONT.var_width,
        this.VAR_FONT.var_height);

        this.btnBetModuleContext.drawImage(number.img,
          number.dx,
          number.dy,
          number.dwidth,
          number.dheight,
          number.sx,
          number.sy,
          number.swidth,
          number.sheight);
    }

    ////////////////////////////////////
    //Grilla De Apuestas - Generadores//
    ////////////////////////////////////

    public doPlenos() {
      let xINC = 0;
      let yINC = 0;

      let betDeusZero = {
        id:0,
        loaded:false,
        type:this.VAR_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:27,
        var_y:107 + this.VAR_OFFSET_Y,
        var_width:this.VAR_PLENOS.var_width,
        var_height:this.VAR_PLENOS.var_height,
        var_max:this.VAR_PLENOS.max,
        var_min:this.VAR_PLENOS.min,
        bet:0,
        multiplier:36,
        zone:[37],
        data:{}
      }
      this.BET_GRID.push(betDeusZero);

      let betZero = {
        id:1,
        loaded:false,
        type:this.VAR_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:27,
        var_y:211 + this.VAR_OFFSET_Y,
        var_width:this.VAR_PLENOS.var_width,
        var_height:this.VAR_PLENOS.var_height,
        var_max:this.VAR_PLENOS.max,
        var_min:this.VAR_PLENOS.min,
        bet:0,
        multiplier:36,
        zone:[0],
        data:{}
      }
      this.BET_GRID.push(betZero);
      //plenos
      let betGrid =
        [3,6,9,12,15,18,21,24,27,30,33,36,//fila 1
        2,5,8,11,14,17,20,23,26,29,32,35,//fila 2
        1,4,7,10,13,16,19,22,25,28,31,34];//fila 3


      for (var i = 2; i < 38; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_PLENOS.var_x + xINC * this.VAR_PLENOS.var_space_x,
          var_y:this.VAR_PLENOS.var_y + yINC * this.VAR_PLENOS.var_space_y,
          var_width:this.VAR_PLENOS.var_width,
          var_height:this.VAR_PLENOS.var_height,
          var_max:this.VAR_PLENOS.max,
          var_min:this.VAR_PLENOS.min,
          bet:0,
          multiplier:36,
          zone:[betGrid[i-2]],
          data:{}
        }
        if (xINC < 11) xINC++;
        else {
          yINC++;
          xINC = 0;
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doSHPlenos() {
      let xINC = 0;
      let yINC = 0;

      let sZero1 = {
        id:0,
        loaded:false,
        type:this.VAR_T_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:72,
        var_y:this.VAR_PLENOS.var_y + this.VAR_PLENOS.var_space_y * 2,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:18,
        zone:[0,1],
        data:{}
      }
      this.BET_GRID.push(sZero1);

      let sZero2 = {
        id:0,
        loaded:false,
        type:this.VAR_T_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:72,
        var_y:this.VAR_PLENOS.var_y,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:18,
        zone:[37,3],
        data:{}
      }
      this.BET_GRID.push(sZero2);
      //semi pleno horizontal
      let betGrid = [
        [3,6],[6,9],[9,12],[12,15],[15,18],[18,21],[21,24],[24,27],[27,30],[30,33],[33,36],//fila 1
        [2,5],[5,8],[8,11],[11,14],[14,17],[17,20],[20,23],[23,26],[26,29],[29,32],[32,35],//fila 2
        [1,4],[4,7],[7,10],[10,13],[13,16],[16,19],[19,22],[22,25],[25,28],[28,31],[31,34]];//fila 3
      for (var i = 2; i < 35; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_SH_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_SH_PLENOS.var_x + xINC * this.VAR_SH_PLENOS.var_space_x,
          var_y:this.VAR_SH_PLENOS.var_y + yINC * this.VAR_SH_PLENOS.var_space_y,
          var_width:this.VAR_SH_PLENOS.var_width,
          var_height:this.VAR_SH_PLENOS.var_height,
          var_max:this.VAR_SH_PLENOS.max,
          var_min:this.VAR_SH_PLENOS.min,
          bet:0,
          multiplier:18,
          zone:betGrid[i-2],
          data:{}
        }
        if (xINC < 10) xINC++;
        else {
          yINC++;
          xINC = 0;
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doSVPlenos() {
      let xINC = 0;
      let yINC = 0;

      let sZero = {
        id:0,
        loaded:false,
        type:this.VAR_SV_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:27,
        var_y:161 + this.VAR_OFFSET_Y,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:18,
        zone:[0,37],
        data:{}
      }
      this.BET_GRID.push(sZero);

      //semi pleno vertical
      let betGrid = [
        [3,2],[6,5],[9,8],[12,11],[15,14],[18,17],[21,20],[24,23],[27,26],[30,29],[33,32],[36,35],//fila 1
        [1,2],[4,5],[7,8],[10,11],[13,14],[16,17],[19,20],[22,23],[25,26],[28,29],[31,32],[34,35]];//fila 2
      for (var i = 1; i < 25; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_SV_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_SV_PLENOS.var_x + xINC * this.VAR_SV_PLENOS.var_space_x,
          var_y:this.VAR_SV_PLENOS.var_y + yINC * this.VAR_SV_PLENOS.var_space_y,
          var_width:this.VAR_SV_PLENOS.var_width,
          var_height:this.VAR_SV_PLENOS.var_height,
          var_max:this.VAR_SV_PLENOS.max,
          var_min:this.VAR_SV_PLENOS.min,
          bet:0,
          multiplier:18,
          zone:betGrid[i-1],
          data:{}
        }
        if (xINC < 11) xINC++;
        else {
          yINC++;
          xINC = 0;
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doQPlenos() {
      let xINC = 0;
      let yINC = 0;
      //cuadros
      let betGrid = [
        [3,2,6,5],[6,5,9,8],[9,8,12,11],[12,11,15,14],[15,14,18,17],[18,17,21,20],[21,20,23,24],[23,24,26,27],[26,27,29,30],[29,30,33,32],[33,32,36,35],//fila 1
        [1,2,4,5],[4,5,7,8],[7,8,10,21],[10,21,13,14],[13,14,16,17],[16,17,19,20],[19,20,22,24],[22,24,25,27],[25,27,28,30],[28,30,31,32],[31,32,34,35]];//fila 2
      for (var i = 0; i < 22; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_Q_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_Q_PLENOS.var_x + xINC * this.VAR_Q_PLENOS.var_space_x,
          var_y:this.VAR_Q_PLENOS.var_y + yINC * this.VAR_Q_PLENOS.var_space_y,
          var_width:this.VAR_Q_PLENOS.var_width,
          var_height:this.VAR_Q_PLENOS.var_height,
          var_max:this.VAR_Q_PLENOS.max,
          var_min:this.VAR_Q_PLENOS.min,
          bet:0,
          multiplier:9,
          zone:betGrid[i],
          data:{}
        }
        if (xINC < 10) xINC++;
        else {
          yINC++;
          xINC = 0;
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doTPlenos() {

      let tZero1 = {
        id:0,
        loaded:false,
        type:this.VAR_T_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:72,
        var_y:this.VAR_Q_PLENOS.var_y + this.VAR_Q_PLENOS.var_space_y,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:12,
        zone:[0,1,2],
        data:{}
      }
      this.BET_GRID.push(tZero1);

      let tZero2 = {
        id:0,
        loaded:false,
        type:this.VAR_T_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:72,
        var_y:161 + this.VAR_OFFSET_Y,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:12,
        zone:[37,9,2],
        data:{}
      }
      this.BET_GRID.push(tZero2);

      let tZero3 = {
        id:0,
        loaded:false,
        type:this.VAR_T_PLENOS.type,
        src:"assets/images/chip.png",
        var_x:72,
        var_y:this.VAR_Q_PLENOS.var_y,
        var_width:this.VAR_T_PLENOS.var_width,
        var_height:this.VAR_T_PLENOS.var_height,
        var_max:this.VAR_T_PLENOS.max,
        var_min:this.VAR_T_PLENOS.min,
        bet:0,
        multiplier:12,
        zone:[37,2,3],
        data:{}
      }
      this.BET_GRID.push(tZero3);

      let iTMP = 0;

      for (var i = 4; i < 16; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_T_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_T_PLENOS.var_x + iTMP * this.VAR_T_PLENOS.var_space_x,
          var_y:this.VAR_T_PLENOS.var_y,
          var_width:this.VAR_T_PLENOS.var_width,
          var_height:this.VAR_T_PLENOS.var_height,
          var_max:this.VAR_T_PLENOS.max,
          var_min:this.VAR_T_PLENOS.min,
          bet:0,
          multiplier:12,
          zone:[iTMP*3+1,iTMP*3+2,+iTMP*3+3],
          data:{}
        }
        this.BET_GRID.push(betTMP);
        iTMP++;
      }
    }
    public doSPlenos() {

      let iTMP = 0;

      for (var i = 0; i < 11; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_S_PLENOS.type,
          src:"assets/images/chip.png",
          var_x:this.VAR_S_PLENOS.var_x + i * this.VAR_S_PLENOS.var_space_x,
          var_y:this.VAR_S_PLENOS.var_y,
          var_width:this.VAR_S_PLENOS.var_width,
          var_height:this.VAR_S_PLENOS.var_height,
          var_max:this.VAR_S_PLENOS.max,
          var_min:this.VAR_S_PLENOS.min,
          bet:0,
          multiplier:6,
          zone:[iTMP*3+1,iTMP*3+2,iTMP*3+3,iTMP*3+4,iTMP*3+5,iTMP*3+6],
          data:{}
        }
        this.BET_GRID.push(betTMP);
        iTMP++;
      }
    }
    public doFChance() {
      let betGrid = [
        [3,6,9,12,15,18,21,24,27,30,33,36],//fila 1
        [2,5,8,11,14,17,20,23,26,29,32,35],//fila 2
        [1,4,7,10,13,16,19,22,25,28,31,34]//fila 3
      ];
      for (var i = 0; i < 3; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_F_CHANCE.type,
          src:"assets/images/chip2.png",
          var_x:this.VAR_F_CHANCE.var_x,
          var_y:this.VAR_F_CHANCE.var_y + i * this.VAR_F_CHANCE.var_space_y,
          var_width:this.VAR_F_CHANCE.var_width,
          var_height:this.VAR_F_CHANCE.var_height,
          var_max:this.VAR_CHANCE.max,
          var_min:this.VAR_CHANCE.min,
          bet:0,
          multiplier:3,
          zone:betGrid[i],
          data:{}
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doDChance() {
      let betGrid = [
        [1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,10,11,12],//docena 1
        [13,14,15,16,17,18,19,20,21,22,23,24],//docena 2
        [25,26,27,28,29,30,31,32,33,34,35,36]//docena 3
      ];
      for (var i = 0; i < 3; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_D_CHANCE.type,
          src:"assets/images/chip2.png",
          var_x:this.VAR_D_CHANCE.var_x + i * this.VAR_D_CHANCE.var_space_x,
          var_y:this.VAR_D_CHANCE.var_y,
          var_width:this.VAR_D_CHANCE.var_width,
          var_height:this.VAR_D_CHANCE.var_height,
          var_max:this.VAR_CHANCE.max,
          var_min:this.VAR_CHANCE.min,
          bet:0,
          multiplier:3,
          zone:betGrid[i],
          data:{}
        }
        this.BET_GRID.push(betTMP);
      }
    }
    public doChance() {
      let betGrid = [
        [1 ,2 , 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18],//menores
        [1 ,3 , 5, 7, 9,11,13,15,17,19,21,23,25,27,29,31,33,35],//impares
        [1 ,3 ,5 ,7 ,9 ,12,14,16,28,19,21,23,25,27,30,32,34,36],//rojo
        [2 ,4 ,6 ,8 ,10,11,13,15,17,20,22,24,26,28,29,31,33,35],//negro
        [2 ,4, 6 ,8 ,10,12,14,16,18,20,22,24,26,28,30,32,34,36],//pares
        [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],//mayores
      ];
      for (var i = 0; i < 6; i++) {
        let betTMP = {
          id:i,
          loaded:false,
          type:this.VAR_CHANCE.type,
          src:"assets/images/chip2.png",
          var_x:this.VAR_CHANCE.var_x + i * this.VAR_CHANCE.var_space_x,
          var_y:this.VAR_CHANCE.var_y,
          var_width:this.VAR_CHANCE.var_width,
          var_height:this.VAR_CHANCE.var_height,
          var_max:this.VAR_CHANCE.max,
          var_min:this.VAR_CHANCE.min,
          bet:0,
          multiplier:2,
          zone:betGrid[i],
          data:{}
        }
        this.BET_GRID.push(betTMP);
      }
    }

    //////////////////////////////////
    //Grilla De Apuestas - Variables//
    //////////////////////////////////

    public VAR_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:116,
      var_y:56 + this.VAR_OFFSET_Y,
      min:1,
      max:10,
      multiplier:36,
      type:"pleno"
    };

    public VAR_SH_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:163,
      var_y:56 + this.VAR_OFFSET_Y,
      min:1,
      max:20,
      multiplier:18,
      type:"semipleno"
    };

    public VAR_SV_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:116,
      var_y:110 + this.VAR_OFFSET_Y,
      min:1,
      max:20,
      multiplier:18,
      type:"semipleno"
    };

    public VAR_Q_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:162,
      var_y:110 + this.VAR_OFFSET_Y,
      min:1,
      max:40,
      multiplier:9,
      type:"cuadro"
    };

    public VAR_T_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:116,
      var_y:0 + this.VAR_OFFSET_Y,
      min:1,
      max:30,
      multiplier:12,
      type:"triple"
    };

    public VAR_S_PLENOS = {
      var_width:this.VAR_CHIP_WIDTH,
      var_height:this.VAR_CHIP_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:163,
      var_y:0 + this.VAR_OFFSET_Y,
      min:1,
      max:60,
      multiplier:6,
      type:"sextuple"
    };

    public VAR_F_CHANCE = {
      var_width:this.VAR_CHIP2_WIDTH,
      var_height:this.VAR_CHIP2_HEIGHT,
      var_space_x: 91,
      var_space_y: 105,
      var_x:1192,
      var_y:58 + this.VAR_OFFSET_Y,
      min:10,
      max:100,
      multiplier:12,
      type:"fila"
    };

    public VAR_D_CHANCE = {
      var_width:this.VAR_CHIP2_WIDTH,
      var_height:this.VAR_CHIP2_HEIGHT,
      var_space_x: 363,
      var_space_y: 105,
      var_x:243,
      var_y:365 + this.VAR_OFFSET_Y,
      min:10,
      max:100,
      multiplier:12,
      type:"docena"
    };

    public VAR_CHANCE = {
      var_width:this.VAR_CHIP2_WIDTH,
      var_height:this.VAR_CHIP2_HEIGHT,
      var_space_x: 181,
      var_space_y: 0,
      var_x:154,
      var_y:452 + this.VAR_OFFSET_Y,
      min:10,
      max:100,
      multiplier:18,
      type:"chance"
    };
}
