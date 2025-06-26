import {Component, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-gear-clock', standalone: true, imports: [CommonModule],
    template: `<canvas #canvas class="gear-canvas"></canvas>`, styleUrl: './GearClock.css'})

export class GearClockComponent implements AfterViewInit
{
    @ViewChild('canvas', {static: true})
    private canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';

    @Input() set hour(v: string) {if (v !== this._hour) {this._hour = v; this.drawClock();}}
    @Input() set minute(v: string) {if (v !== this._minute) {this._minute = v; this.drawClock();}}
    @Input() set second(v: string) {if (v !== this._second) {this._second = v; this.drawClock();}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v; this.drawClock();}}

    ngAfterViewInit()
    {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this.drawClock();
    }

    private drawClock()
    {
        if (!this.ctx) return;
        const canvas = this.canvasRef.nativeElement;
        const ctx = this.ctx;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        let h24 = parseInt(this._hour, 10) || 0;
        if (this._period === 'PM' && h24 < 12) h24 += 12;
        if (this._period === 'AM' && h24 === 12) h24 = 0;
        const m = parseInt(this._minute, 10) || 0;
        const s = parseInt(this._second, 10) || 0;

        const secAngle = (s / 60) * 2 * Math.PI;
        const minuteAngle = ((m + s / 60) / 60) * 2 * Math.PI;
        const hourAngle = (((h24 % 12) + m / 60) / 12) * 2 * Math.PI;

        const gears =
        [
            {radius: Math.min(w, h) * 0.30, teeth: 30, xR: 0.26, color: '#4A90E2', angle: hourAngle},
            {radius: Math.min(w, h) * 0.20, teeth: 24, xR: 0.56, color: '#00ff00', angle: minuteAngle},
            {radius: Math.min(w, h) * 0.15, teeth: 16, xR: 0.78, color: '#ff3b3b', angle: secAngle},
        ];

        gears.forEach(g =>
        {
            const x = g.xR * w;
            const y = h / 2;
            this.drawGear(ctx, x, y, g.radius, g.teeth, g.angle, g.color);
        });
    }

    private drawGear(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, teeth: number,
        rotation: number, color: string)
    {
        const toothHeight = radius * 0.15;
        const innerR = radius - toothHeight;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(0, 0, innerR, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        for (let i = 0; i < teeth; i++)
        {
            const a = (i / teeth) * 2 * Math.PI;
            const x1 = Math.cos(a) * innerR;
            const y1 = Math.sin(a) * innerR;
            const x2 = Math.cos(a) * (innerR + toothHeight);
            const y2 = Math.sin(a) * (innerR + toothHeight);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.restore();
    }
}