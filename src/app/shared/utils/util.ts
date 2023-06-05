import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

import { environment } from './../../../environments/environment';
import { CapacitorUtils } from './capacitor.util';

@Injectable()
export class Util {
    public static getApiBaseUrl(): string {
        let apiBaseUrl = '';
        if (window.location.href.indexOf('localhost') >= 0 || window.location.port === '4200') {
            apiBaseUrl = environment.apiBaseUrl;
        }

        return apiBaseUrl;
    }

    public static getCurrentServerBaseUrl(): string {
        let apiBaseUrl = window.location.protocol + '//' + window.location.host;
        if (window.location.href.indexOf('localhost') >= 0 || window.location.port === '4200') {
            apiBaseUrl = environment.apiBaseUrl;
        }

        return apiBaseUrl;
    }

    public static sortAsString(objectValue: any): string {
        const oldObj = objectValue;
        const obj = (oldObj.length || oldObj.length === 0) ? [] : {};
        for (const key of Object.keys(this).sort((a, b) => a.localeCompare(b))) {
            const type = typeof (oldObj[key]);
            if (type === 'object') {
                obj[key] = oldObj[key].stringifySorted();
            } else {
                obj[key] = oldObj[key];
            }
        }
        return JSON.stringify(obj);
    }

    public static getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key] === value);
    }

    public static sortDescending(list): any[] {
        return list.sort((a, b) => b - a);
    }

    public static sortAscending(list): any[] {
        return list.sort((a, b) => a - b);
    }

    public static isEmptyOrNull(obj: any): boolean {
        let isEmpty = false;
        try {
            if (obj === null) {
                isEmpty = true;
            } else if (typeof obj === 'object') {
                isEmpty = Object.keys(obj).length === 0;
            } else {
                isEmpty = typeof obj === 'undefined' || obj.length <= 0;
            }
        } catch (e) {
            isEmpty = true;
        }
        return isEmpty;
    }

    public static toNumber(value: any): number {
        if (isNaN(parseInt(value, 10))) {
            return 0;
        } else {
            return parseInt(value, 10);
        }
    }

    public static toInteger(value: any): number {
        return parseInt(`${value}`, 10);
    }

    public static isNumber(value: any): value is number {
        return !isNaN(this.toInteger(value));
    }

    public static padNumber(value: number) {
        if (this.isNumber(value)) {
            return `0${value}`.slice(-2);
        } else {
            return '';
        }
    }

    public static routeParamStringToObject(routeParams: string[]): any {
        if (routeParams != null) {
            const routeParamsObj = {};
            routeParams.forEach((routeString) => {
                const tempRouteString = routeString.split('=');
                routeParamsObj[tempRouteString[0]] = tempRouteString[1];
            });
            return routeParamsObj;
        }
        return null;
    }

    public static breakdownRoute(routePath: string): any {
        // /accounts/update-bank?addBank=false#bank
        const routeBase1 = routePath.split('?');
        const routeBase = routeBase1[0];
        const routeBase2 = routeBase1[1] !== undefined ? routeBase1[1].split('#') : '';
        const routeParamsObj = this.routeParamStringToObject(routeBase2[0] !== undefined ? routeBase2[0].split('&') : null);
        const routeFragment = routeBase2[1];
        return {
            base: routeBase,
            params: routeParamsObj,
            fragments: routeFragment
        };
    }
    // myObjArray - List of object in array, objKey - key of the value( for getting unique first record )
    public static getUniqueList(myObjArray: any, objKey: string) {
        const result = [];
        const map = new Map();
        for (const item of myObjArray) {
            if (!map.has(item[objKey])) {
                map.set(item[objKey], true);    // set any value to Map
                result.push(item);
            }
        }
        return result;
    }

    public static async openExternalUrl(redirectURL, target = '_blank') {
        if (CapacitorUtils.isApp) {
            await Browser.open({ url: encodeURI(redirectURL) });
        } else {
            window.open(redirectURL, target);
        }
    }

    public static closeBrowser(){
        if (!CapacitorUtils.isAndroidDevice){
            Browser.close();
        }
    }
}
