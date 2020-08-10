// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import 'zone.js/dist/zone-testing';

declare const __karma__: any;
declare const require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = () => {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
//const context = require.context('./app/investment/', true, /\.spec\.ts$/);
const context = require.context('./app/comprehensive/my-liabilities/', true, /my-liabilities\.component\.spec\.ts$/);
//const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

// Finally, start Karma to run the tests
__karma__.start();
