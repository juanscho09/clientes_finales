import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ENV } from './environment';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), HttpClientModule, IonicStorageModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, ENV, CallNumber, EmailComposer, StatusBar, SplashScreen, Badge],
  bootstrap: [AppComponent],
})
export class AppModule {}
