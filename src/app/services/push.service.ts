import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  userId: string;

  mensajes: OSNotificationPayload[] = [];

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: NativeStorage) { 
    this.cargarMensajes();
  }

  async getMensajes(){
    await this.cargarMensajes();
    console.log("getMessages", this.mensajes);
    return [...this.mensajes];
  }

  configuracionInicial(){
    this.oneSignal.startInit('b153c50f-71d3-48de-b4d2-07813397814a', '406582062830');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    
    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
     // do something when notification is received
     console.log("Noti Recibida", noti);
     this.notificacionRecibida(noti);
    });
    
    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log("Noti abierta", noti);
      await this.notificacionRecibida(noti.notification);
    });

    //Obtener Use Id del suscriptor
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
      console.log(this.userId);
    });
    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification){
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID );
    if (existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajes();
  }

  async guardarMensajes(){
    await this.storage.setItem("mensajes", this.mensajes);
    // this.storage.setItem("mensajes", this.mensajes)
    // .then(
    //   () => console.log('Stored item!'),
    //   error => console.error('Error storing item', error)
    // );
  }

  async cargarMensajes(){
    // console.log("Cargar antes",this.mensajes);
    // this.mensajes = await this.storage.getItem("mensajes") || [];
    // console.log("Cargasr despues", this.mensajes);
    // return this.mensajes;
    await this.storage.getItem("mensajes")
    .then(
      data => {
        this.mensajes = data;
        return this.mensajes;
      },
      error => {
        this.mensajes = [];
        return this.mensajes;
      }
    ); 
  }

  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
