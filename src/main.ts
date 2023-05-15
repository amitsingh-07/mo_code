import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { CapacitorUtils } from './app/shared/utils/capacitor.util';

// Implementing Brand to Body
if (environment.brand) {
  document.body.setAttribute('class', environment.brand + '-theme');
}

/* Google Tag Manager */
if (environment.gtagPropertyId && !CapacitorUtils.isApp) {
  const g_tag_script = document.createElement('script');
  // tslint:disable-next-line:max-line-length
  g_tag_script.innerHTML = 'window.dataLayer = window.dataLayer || [];\n (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start": new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src= "https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f); })(window,document,"script","dataLayer","' + environment.gtagPropertyId + '");';
  document.head.appendChild(g_tag_script);

  const g_tag_noscript = document.createElement('noscript');
  const g_tag_iframe = document.createElement('iframe');
  g_tag_iframe.setAttribute('src', 'https://www.googletagmanager.com/ns.html?id=' + environment.gtagPropertyId);
  g_tag_iframe.setAttribute('height', '0');
  g_tag_iframe.setAttribute('width', '0');
  g_tag_iframe.setAttribute('style', 'display:none;visibility:hidden');
  g_tag_noscript.appendChild(g_tag_iframe);
  document.body.appendChild(g_tag_noscript);
}

/* Google Ad Pixel Code */
if (environment.gAdPropertyId && !CapacitorUtils.isApp) {
  const g_pixel_script = document.createElement('script');
  g_pixel_script.setAttribute('async', 'true');
  g_pixel_script.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + environment.gAdPropertyId);
  document.head.appendChild(g_pixel_script);
}

/* Google Analytics Code */
if (!CapacitorUtils.isApp) {
  const ga_script = document.createElement('script');
  // tslint:disable-next-line:max-line-length
  ga_script.innerHTML = '(function (i, s, o, g, r, a, m) {i["GoogleAnalyticsObject"] = r; i[r] = i[r] || function () {(i[r].q = i[r].q || []).push(arguments)}, i[r].l = 1 * new Date(); a = s.createElement(o), m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)})(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\'); ga("create", "' + environment.gaPropertyId + '", "auto");';
  document.head.appendChild(ga_script);
}

/* Facebook Pixel Code */
if (environment.fbPropertyId && !CapacitorUtils.isApp) {
  const fb_pixel_script = document.createElement('script');
  // tslint:disable-next-line:max-line-length
  fb_pixel_script.innerHTML = '!function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\'; n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)}(window,document,"script", "https://connect.facebook.net/en_US/fbevents.js"); fbq("init", "' + environment.fbPropertyId + '");';
  document.head.appendChild(fb_pixel_script);
}

/* AdRoll Property and Pixel Code */
if (environment.adRollAdvId && environment.adRollPropertyId && !CapacitorUtils.isApp) {
  const adroll_pixel_script = document.createElement('script');
  adroll_pixel_script.setAttribute('type', 'text/javascript');
  // tslint:disable-next-line:max-line-length
  adroll_pixel_script.innerHTML = 'adroll_adv_id = "' + environment.adRollAdvId + '"; adroll_pix_id = "' + environment.adRollPropertyId + '"; var _onload = function(){ if (document.readyState && !/loaded|complete/.test(document.readyState)){setTimeout(_onload, 10);return} if (!window.__adroll_loaded){__adroll_loaded=true;setTimeout(_onload, 50);return} var scr = document.createElement("script"); var host = (("https:" == document.location.protocol) ? "https://s.adroll.com" : "http://a.adroll.com"); scr.setAttribute(\'async\', \'true\'); scr.type = "text/javascript"; scr.src = host + "/j/roundtrip.js"; ((document.getElementsByTagName(\'head\') || [null])[0] || document.getElementsByTagName(\'script\')[0].parentNode).appendChild(scr); }; if (window.addEventListener) {window.addEventListener(\'load\', _onload, false);} else {window.attachEvent(\'onload\', _onload)} ';
  document.body.appendChild(adroll_pixel_script);
}

/* Hubspot Script */
if (environment.hsPortalId && !CapacitorUtils.isApp) {
  const hs_script = document.createElement('script');
  hs_script.setAttribute('type', 'text/javascript');
  hs_script.setAttribute('async', 'true');
  hs_script.setAttribute('defer', 'true');
  hs_script.setAttribute('src', 'https://js.hs-scripts.com/' + environment.hsPortalId + '.js');
  document.head.appendChild(hs_script);
}

/* Tiktok Pixel Script */
if (environment.hsPortalId && !CapacitorUtils.isApp) {
  const hs_script = document.createElement('script');
  hs_script.setAttribute('type', 'text/javascript');
  hs_script.setAttribute('src', 'assets/scripts/tiktok-pixel.min.js');
  document.head.appendChild(hs_script);
}

if (environment.production) {
  // Specific Prod Tools
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err) => console.log(err));