import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { CapacitorUtils } from '../utils/capacitor.util';
import { environment } from './../../../environments/environment';

declare let ga: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  constructor(public router: Router) {
  }

  public initGoogleAnalyticsService() {
    // Initialization for Google Pixel
    if (!CapacitorUtils.isApp) {
      this.gtag('js', new Date());
      this.gtag('config', environment.gAdPropertyId);
      // Router Events
      this.router.events.subscribe((event) => {
        try {
          if (typeof ga === 'function') {
            if (event instanceof NavigationEnd) {
              ga('set', 'page', event.urlAfterRedirects);
              ga('send', 'pageview');
            }
          }
        } catch (e) {
          console.log(e);
        }
      });
    }
  }

  private gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }

  // Emit Conversions
  public emitConversionsTracker(trackingId: string) {
    if (!CapacitorUtils.isApp) {
      const updatedTrackingId: string = environment.gAdPropertyId + '/' + trackingId;
      try {
        this.gtag(
          'event', 'conversion', {
          send_to: updatedTrackingId
        }
        );
        return true;
      } catch (Exception) {
        return false;
      }
    }
  }

  public emitEvent(eventCategory: string,
    eventAction: string,
    eventLabel: string = null,
    eventValue: number = null) {
    if (typeof ga === 'function' && !CapacitorUtils.isApp) {
      ga('send', 'event', {
        eventCategory,
        eventLabel,
        eventAction,
        eventValue
      });
    }
  }

  public emitSocial(socialNetwork: string,
    socialAction: string,
    socialTarget: string,
  ) {
    if (typeof ga === 'function' && !CapacitorUtils.isApp) {
      ga('send', 'social', {
        socialNetwork,
        socialAction,
        socialTarget
      });
    }
  }

  // Timing Functions
  public startTime(timeId: string) {
    if (!CapacitorUtils.isApp) {
      const name: string = 'time_' + timeId;
      const expireDays = 1;
      const currDate: Date = new Date();
      const d: Date = new Date();
      d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
      const expires = `expires=${d.toUTCString()}`;
      document.cookie = `${name}=${currDate}; ${expires}`;
    }
  }

  public getTime(timeId: string) {
    if (!CapacitorUtils.isApp) {
      const name: string = 'time_' + timeId;
      const ca: string[] = document.cookie.split(';');
      const caLen: number = ca.length;
      const cookieName = `${name}=`;
      let c: string;
      let oldDate: string = null;
      const d: Date = new Date();
      let timeDiff = 0;
      const currDate = `${d.toUTCString()}`;

      for (let i = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) === 0) {
          oldDate = c.substring(cookieName.length, c.length);
        }
      }
      if (oldDate !== 'null') {
        timeDiff = (Date.parse(currDate) - Date.parse(oldDate));
        return timeDiff;
      } else {
        return false;
      }
    }
  }

  public endTime(timeId: string) {
    if (!CapacitorUtils.isApp) {
      const name: string = 'time_' + timeId;
      const empty = null;
      const d: Date = new Date();
      d.setTime(d.getTime() + 1000 * 10); // Setting Expire in 10secs
      const expires = `expires=${d.toUTCString()}`;
      document.cookie = `${name}=${empty}; ${expires}`;
    }
  }

  public emitTime(timeId: string,
    timingCategory: string,
    timingVar: string,
    timingLabel: string = null
  ) {
    const timingValue = this.getTime(timeId);
    this.endTime(timeId);
    if (typeof ga === 'function' && !CapacitorUtils.isApp) {
      this.endTime(timeId);
      ga('send', 'timing', [timingCategory], [timingVar], [timingValue], [timingLabel]);
    }
  }

}
