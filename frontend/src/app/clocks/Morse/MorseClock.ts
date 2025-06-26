import {Component, Input, OnDestroy, NgZone} from '@angular/core';
import {CommonModule} from '@angular/common';
interface MorseTiming {dot: number; dash: number; intra: number; letter: number; loop: number;}

@Component({selector: 'app-morse-clock', standalone: true, imports: [CommonModule],
    templateUrl: './MorseClock.html', styleUrl: './MorseClock.css'})

export class MorseClockComponent implements OnDestroy
{
    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';

    @Input() set hour(v: string) {if (v !== this._hour) {this._hour = v; this.resetHour();}}
    @Input() set minute(v: string) {if (v !== this._minute) {this._minute = v; this.resetMinute();}}
    @Input() set second(v: string) {if (v !== this._second) {this._second = v; this.updateSeconds();}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v; this.resetHour();}}

    blinkH = false;
    blinkM = false;
    morseS = '';
    private timerH: any;
    private timerM: any;

    private T_H: MorseTiming = {dot: 200, dash: 600, intra: 200, letter: 600, loop: 100};
    private T_M: MorseTiming = {dot: 150, dash: 450, intra: 150, letter: 450, loop: 50};

    private readonly MORSE: Record<string, string> =
    {
        '0': '-----',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.'
    };

    constructor(private zone: NgZone) {}

    ngOnDestroy()
    {
        clearTimeout(this.timerH);
        clearTimeout(this.timerM);
    }

    private resetHour() {this.buildAndPlay(this._hour, this.blinkHSetter, this.timerSetterH, this.T_H);}
    private resetMinute() {this.buildAndPlay(this._minute, this.blinkMSetter, this.timerSetterM, this.T_M);}

    private updateSeconds()
    {
        const s = parseInt(this._second, 10) || 0;
        const sStr = String(s).padStart(2, '0');
        let morseCode = '';
        sStr.split('').forEach((d, idx) =>
        {
            morseCode += this.MORSE[d];
            if (idx < sStr.length - 1) morseCode += ' ';
        });
        this.morseS = morseCode;
    }


    private blinkHSetter = (v: boolean) => this.blinkH = v;
    private blinkMSetter = (v: boolean) => this.blinkM = v;
    private timerSetterH = (h: any) => this.timerH = h;
    private timerSetterM = (m: any) => this.timerM = m;

    private buildAndPlay(val: string, ledSetter: (on: boolean) => void, timerSetter: (t: any) => void, T: MorseTiming)
    {
        clearTimeout(timerSetter === this.timerSetterH ?
            this.timerH : timerSetter === this.timerSetterM ? this.timerM : null);

        let raw = val;
        if (ledSetter === this.blinkHSetter)
        {
            let h = parseInt(val, 10) || 0;
            if (this._period === 'PM' && h < 12) h += 12;
            if (this._period === 'AM' && h === 12) h = 0;
            raw = String(h).padStart(2, '0');
        }

        const digits = raw.padStart(2, '0').split('');
        const seq: {on: boolean; dur: number} [] = [];
        digits.forEach((d, idx) =>
        {
            const code = this.MORSE[d];
            for (let i = 0; i < code.length; i++)
            {
                seq.push({on: true, dur: code[i] === '.' ? T.dot : T.dash});
                if (i < code.length - 1) seq.push({on: false, dur: T.intra});
            }
            if (idx < digits.length - 1) seq.push({on: false, dur: T.letter});
        });
        seq.push({on: false, dur: T.loop});
        this.zone.runOutsideAngular(() =>
            {timerSetter(setTimeout(() => {this.zone.run(() => this.playStep(seq, 0, ledSetter, timerSetter));}, 50));});
    }

    private playStep(seq: {on: boolean; dur: number}[], idx: number, ledSetter: (b: boolean) => void,
        timerSetter: (t: any) => void)
    {
        const step = seq[idx];
        ledSetter(step.on);
        const next = (idx + 1) % seq.length;
        timerSetter(setTimeout(() => {this.zone.run(() => this.playStep(seq, next, ledSetter, timerSetter));}, step.dur));
    }
}