export interface IProgressTrackerData {
    title: string;
    subTitle?: string;
    properties?: IProgressTrackerProperties;
    items: IProgressTrackerItem[];
}

export interface IProgressTrackerProperties {
    disabled?: boolean;
    readOnly?: boolean;
}

export class IProgressTrackerItem {
    title: string;
    expanded = false;
    showArrow = false;
    path?: string;
    completed = false;
    customStyle?: string;
    subItems: IProgressTrackerSubItem[];
}

export interface IProgressTrackerSubItem {
    id: string;
    path: string;
    title: string;
    value: string;
    completed: boolean;
    hidden?: boolean;
    list?: IProgressTrackerSubItemList[];
}

export interface IProgressTrackerSubItemList {
    title: string;
    value: string;
}
