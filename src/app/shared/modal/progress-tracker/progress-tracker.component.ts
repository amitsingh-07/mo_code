import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { ProgressTrackerService } from './progress-tracker.service';
import { IProgressTrackerData, IProgressTrackerItem } from './progress-tracker.types';

@Component({
    selector: 'app-progress-tracker',
    templateUrl: './progress-tracker.component.html',
    styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent implements OnInit {
    data: IProgressTrackerData;
    private subscription: Subscription;

    currentPath = '';
    pathRegex = /../;

    constructor(
        private progressService: ProgressTrackerService,
        private route: Router
    ) {
        this.currentPath = this.route.url;
        this.subscription = this.progressService.getProgressTrackerData().subscribe((progressData) => {
            if (progressData) {
                this.data = progressData;
            } else {
                this.data = {} as IProgressTrackerData;
            }
        });
    }

    ngOnInit() { }

    public onCloseClick(): void {
        this.progressService.hide();
    }

    public toggle(item: IProgressTrackerItem) {
        item.expanded = !item.expanded;
    }

    public navigate(path: string) {
        // TODO : Navigate to the 'path'
    }
}
