import {Component, Input, HostBinding} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-color-pulse-clock', standalone: true,
    imports: [CommonModule], template: `<div class="color-pulse"><div class="hsl-label">{{bgColor}}</div></div>`,
    styleUrl: './ColorPulse.css'})

export class ColorPulseClockComponent
{
    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';

    @HostBinding('style.backgroundColor')
    bgColor = 'hsl(0, 0%, 0%)';
    @HostBinding('style.transition')
    bgTrans = 'background-color 1s linear';

    constructor() {this.updateColor();}

    @Input() set hour(v: string) {if (v !== this._hour) {this._hour = v; this.updateColor();}}
    @Input() set minute(v: string) {if (v !== this._minute) {this._minute = v; this.updateColor();}}
    @Input() set second(v: string) {if (v !== this._second) {this._second = v;this.updateColor();}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v; this.updateColor();}}

    private updateColor()
    {
        let h = parseInt(this._hour, 10) || 0;
        if (this._period === 'PM' && h < 12) h += 12;
        if (this._period === 'AM' && h === 12) h = 0;

        const m = parseInt(this._minute, 10) || 0;
        const s = parseInt(this._second, 10) || 0;
        const hue = Math.round((h / 24) * 360);
        const sat = Math.round((m / 60) * 100);
        const light = Math.round((s / 60) * 100);

        this.bgColor = `hsl(${hue}, ${sat}%, ${light}%)`;
    }
}