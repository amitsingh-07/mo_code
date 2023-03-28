import { HttpXhrBackend, HttpBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NativeHttpFallback } from 'ionic-native-http-connection-backend';

@Injectable()
export class HttpForceXhrBackend implements HttpBackend {
    constructor(
        private native: NativeHttpFallback,
        private xhr: HttpXhrBackend,
    ) {}

    handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        // Temporary solution to force back to Angular HTTP for certain API calls not working
        if (req.url.includes('saveDocuments')) {
            return this.xhr.handle(req);
        } else {
            return this.native.handle(req);
        }
    }
}