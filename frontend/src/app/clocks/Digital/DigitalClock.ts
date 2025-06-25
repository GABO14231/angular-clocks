import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-digital-clock', standalone: true, imports: [CommonModule],
    templateUrl: './DigitalClock.html', styleUrls: ['./DigitalClock.css']})

export class DigitalClockComponent
{
    @Input() hour: string = '';
    @Input() minute: string = '';
    @Input() second: string = '';
    @Input() period: string = '';
}