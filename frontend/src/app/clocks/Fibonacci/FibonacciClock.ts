import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-fibonacci-clock', standalone: true, imports: [CommonModule],
    templateUrl: './FibonacciClock.html', styleUrl: './FibonacciClock.css'})

export class FibonacciClockComponent
{
    sizesH = [8, 5, 3, 2, 1, 1];
    sizesMS = [34, 21, 13, 8, 5, 3, 2, 1];
    litH: boolean[] = [];
    litM: boolean[] = [];
    litS: boolean[] = [];

    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';

    @Input() set hour(v: string) {if (v !== this._hour) {this._hour = v; this.updateClock();}}
    @Input() set minute(v: string) {if (v !== this._minute) {this._minute = v; this.updateClock();}}
    @Input() set second(v: string) {if (v !== this._second) {this._second = v; this.updateClock();}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v; this.updateClock();}}

    private updateClock()
    {
        this.updateHours();
        this.updateMinSec();
    }

    private updateHours()
    {
        let h = parseInt(this._hour, 10) || 0;
        if (this._period === 'PM' && h < 12) h += 12;
        if (this._period === 'AM' && h === 12) h = 0;
        const h12 = h % 12;
        let rem = h12;
        this.litH = this.sizesH.map(sz => {if (sz <= rem) {rem -= sz; return true;} return false;});
    }

    private updateMinSec()
    {
        const m = parseInt(this._minute, 10) || 0;
        const s = parseInt(this._second, 10) || 0;

        let remM = m;
        this.litM = this.sizesMS.map(sz => {if (sz <= remM) {remM -= sz; return true;} return false;});
        let remS = s;
        this.litS = this.sizesMS.map(sz => {if (sz <= remS) {remS -= sz; return true;} return false;});
    }
}