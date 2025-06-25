import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-fibonacci-clock', standalone: true, imports: [CommonModule],
    templateUrl: './FibonacciClock.html', styleUrl: './FibonacciClock.css'})

export class FibonacciClockComponent implements OnChanges
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

    @Input() set hour(v: string) {this._hour = v; this.update();}
    @Input() set minute(v: string) {this._minute = v; this.update();}
    @Input() set second(v: string) {this._second = v; this.update();}
    @Input() set period(v: string) {this._period = v; this.update();}

    ngOnChanges(_: SimpleChanges) {this.update();}

    private update()
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