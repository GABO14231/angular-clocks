import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-digital-clock', standalone: true, imports: [CommonModule],
    templateUrl: './DigitalClock.html',styleUrls: ['./DigitalClock.css']})

export class DigitalClockComponent
{
    @Input() time: string = '';
    get parsedTime()
    {
        let clean = this.time.replace(/\s+/g, ' ').trim();
        let parts = clean.split(':');
        if (parts.length < 3) return {hour: '', minute: '', second: '', period: ''};
        let hour = parts[0].trim();
        let minute = parts[1].trim();
        let secAndPeriod = parts[2].trim().split(' ');
        let second = secAndPeriod[0];
        let period = secAndPeriod[1] || '';
        return { hour, minute, second, period };
    }
}