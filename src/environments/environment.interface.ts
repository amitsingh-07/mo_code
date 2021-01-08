export interface IEnvironment {
    production: boolean;
    isDebugMode: boolean;
    apiBaseUrl: string;
    myInfoClientId: string;
    myInfoCallbackBaseUrl: string;
    myInfoAuthorizeUrl: string;
    gaPropertyId: string; // Google Analytics
    gAdPropertyId?: string; // Google Pixel
    gtagPropertyId?: string; // Google Tag Manager
    fbPropertyId?: string; // Facebook Pixel
    adRollPropertyId?: string; // AdRoll Property Id
    adRollAdvId?: string; // AdRoll Advert Id
    brand ?: string; // Project G
    hideHomepage?: boolean; // Toggle MO homepage on/off
    mockInvestAccount?: boolean; // Mock investment account creating using simulator
    expire2faTime?: number; // time before 2fa timeout
    expire2faPollRate?: number; // interval for checks
    expire2faMaxCheck?: number; // max number of checks
}
