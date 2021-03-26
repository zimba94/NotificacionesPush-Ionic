import { ApplicationRef, Component, OnInit } from '@angular/core';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  mensajes: OSNotificationPayload[] = [];

  constructor(public pushService: PushService,
              private aplicationRef: ApplicationRef ) {

              }

  ngOnInit(){
    this.pushService.pushListener.subscribe( noti => {
      this.mensajes.unshift(noti);
      this.aplicationRef.tick();
    });
  }

  async ionViewDidEnter(){
    console.log("will enter - cargar msjs")
    this.mensajes = await this.pushService.getMensajes();
    console.log("Notis: ",this.mensajes);
  }

  async borrarMensajes(){
    await this.pushService.borrarMensajes();
    this.mensajes = [];
  }
}
