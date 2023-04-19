import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { CapacitorUtils } from '../utils/capacitor.util';

declare const fbq: any;

@Injectable({
  providedIn: 'root'
})
export class FBPixelService {

  constructor(public router: Router) {
    this.router.events.subscribe((event) => {
      try {
        if (typeof fbq === 'function') {
          if (event instanceof NavigationEnd) {
            fbq('track', 'PageView');
            fbq('trackCustom', 'Microdata');
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
   }

   public track(trackId: string) {
    if (typeof fbq === 'function' && !CapacitorUtils.isApp) {
      fbq('track', trackId);
    }
   }

  }
