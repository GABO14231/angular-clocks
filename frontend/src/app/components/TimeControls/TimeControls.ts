import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({selector: 'app-clock', standalone: true, imports: [FormsModule, CommonModule],
    templateUrl: './TimeControls.html', styleUrls: ['./TimeControls.css']})

export class TimeControlsComponent implements OnInit, OnDestroy
{
    hours: number = 0;
    minutes: number = 0;
    seconds: number = 0;
    is24HourFormat: boolean = true;
    intervalId: any;
    controlMode: 'sliders' | 'buttons' | 'inputs' = 'sliders';

    constructor() {}

    ngOnInit(): void
    {
        this.resetToSystemTime();
        this.startClock();
    }

    ngOnDestroy(): void {clearInterval(this.intervalId);}

    resetToSystemTime(): void
    {
        const now = new Date();
        this.hours = now.getHours();
        this.minutes = now.getMinutes();
        this.seconds = now.getSeconds();
    }

    startClock(): void
    {
        this.intervalId = setInterval(() =>
        {
            this.seconds++;
            if (this.seconds >= 60)
            {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.minutes >= 60)
            {
                this.minutes = 0;
                this.hours++;
            }
            if (this.hours >= 24) {this.hours = 0;}
        }, 1000);
    }

    increment(unit: 'hours' | 'minutes' | 'seconds'): void
    {
        if (unit === 'hours') this.hours = (this.hours + 1) % 24;
        else if (unit === 'minutes') this.minutes = (this.minutes + 1) % 60;
        else if (unit === 'seconds') this.seconds = (this.seconds + 1) % 60;
    }

    decrement(unit: 'hours' | 'minutes' | 'seconds'): void
    {
        if (unit === 'hours') this.hours = (this.hours - 1 + 24) % 24;
        else if (unit === 'minutes') this.minutes = (this.minutes - 1 + 60) % 60;
        else if (unit === 'seconds') this.seconds = (this.seconds - 1 + 60) % 60;
    }

    toggleFormat(): void {this.is24HourFormat = !this.is24HourFormat;}

    get formattedTime(): string
    {
        let hrStr: string;
        let period = "";
        if (this.is24HourFormat) hrStr = this.hours.toString().padStart(2, '0');
        else
        {
            let hr12 = this.hours % 12;
            if (hr12 === 0) { hr12 = 12; }
            hrStr = hr12.toString().padStart(2, '0');
            period = this.hours >= 12 ? 'PM' : 'AM';
        }
        const minStr = this.minutes.toString().padStart(2, '0');
        const secStr = this.seconds.toString().padStart(2, '0');
        return `${hrStr} : ${minStr} : ${secStr}${period ? ' ' + period : ''}`;
    }

    get spinnerHour(): string
    {
        if (this.is24HourFormat) return this.hours.toString().padStart(2, '0');
        else
        {
            let hr12 = this.hours % 12;
            if (hr12 === 0) { hr12 = 12; }
            return hr12.toString().padStart(2, '0');
        }
    }
}