import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-binary-clock', standalone: true, imports: [CommonModule], templateUrl: './BinaryClock.html',
    styleUrl: './BinaryClock.css'})

export class BinaryClockComponent
{
    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';
    bits: boolean[][] = [];

    @Input() set hour(v: string) {if (v !== this._hour) {this._hour = v; this.updateBits();}}
    @Input() set minute(v: string) {if (v !== this._minute) {this._minute = v; this.updateBits();}}
    @Input() set second(v: string) {if (v !== this._second) {this._second = v; this.updateBits();}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v; this.updateBits();}}

    constructor() {this.updateBits();}

    private updateBits()
    {
        let h = parseInt(this._hour, 10) || 0;
        if (this._period === 'PM' && h < 12) h += 12;
        if (this._period === 'AM' && h === 12) h = 0;
        const m = parseInt(this._minute, 10) || 0;
        const s = parseInt(this._second, 10) || 0;
        const digits = [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10];
        const rows = 4;
        const grid: boolean[][] = [];
        for (let r = 0; r < rows; r++)
        {
            const mask = 1 << (rows - 1 - r);
            grid[r] = digits.map(d => (d & mask) !== 0);
        }
        this.bits = grid;
    }

    getBitValue(rowIndex: number): number
    {
        const rows = 4;
        return 1 << (rows - 1 - rowIndex);
    }
}