export interface IPromotion {
    type: number;
    promoId: number;
    owner: string;
    title: string;
    thumbnail: string;
    thumbnail_mobile ?: string;
    banner ?: string;
    desc: string;
    date_created: string;
    date_expiry: string;
    tag: any;
    external: boolean;
    url ?: string;
    button_label ?: string;
    logo ?: string;
    bundle_enquiry_form_type ?: string;
    bundle_enquiry_form_title ?: string;
    bundle_enquiry_form_subtitle ?: string;
    bundle_enquiry_child_enabled ?: boolean;
    tracking_id ?: string;
    tnc ?: boolean;
}

export interface IBundleEnquiry {
    firstName: string;
    lastName: string;
    emailAddress: string;
    contactNumber: string;
    dateOfBirth: string;
    gender: string;
    enquiryType: string;
    receiveMarketingEmails: string;
}
