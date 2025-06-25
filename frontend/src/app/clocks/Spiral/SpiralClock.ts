import {Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-spiral-clock', standalone: true, imports: [CommonModule],
    template: `<canvas #canvas></canvas>`, styleUrl: './SpiralClock.css'})

export class SpiralClockComponent implements AfterViewInit, OnDestroy
{
    @ViewChild('canvas', {static: true})
    private canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private _hour = '00';
    private _minute = '00';
    private _second = '00';
    private _period = '';

    @Input() set hour(v: string) {this._hour = v; this.draw();}
    @Input() set minute(v: string) {this._minute = v; this.draw();}
    @Input() set second(v: string) {this._second = v; this.draw();}
    @Input() set period(v: string) {this._period = v; this.draw();}

    private maxTurns = 3;
    private maxTheta = this.maxTurns * Math.PI * 2;
    private padding = 10;

    ngAfterViewInit()
    {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this.draw();
    }

    ngOnDestroy() {}

    private draw()
    {
        if (!this.ctx) return;
        const c = this.canvasRef.nativeElement;
        const ctx = this.ctx;
        const w = c.width, h = c.height;
        const cx = w / 2, cy = h / 2;
        const radiusMax = Math.min(cx, cy) - this.padding;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let θ = 0; θ <= this.maxTheta; θ += 0.02)
        {
            const r = (radiusMax / this.maxTheta) * θ;
            const x = cx + r * Math.cos(θ);
            const y = cy + r * Math.sin(θ);
            if (θ === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const [hF, mF, sF] = this.computeNorms();

        this.plotDot(ctx, cx, cy, radiusMax, hF, 'red');
        this.plotDot(ctx, cx, cy, radiusMax, mF, 'lime');
        this.plotDot(ctx, cx, cy, radiusMax, sF, 'cyan');
    }

    private computeNorms(): [number, number, number]
    {
        let h = parseInt(this._hour, 10) || 0;
        if (this._period === 'PM' && h < 12) h += 12;
        if (this._period === 'AM' && h === 12) h = 0;
        const m = parseInt(this._minute, 10) || 0;
        const s = parseInt(this._second, 10) || 0;
        const h12 = h % 12;
        return [(h12 + m / 60 + s / 3600) / 12, (m + s / 60) / 60, s / 60];
    }

    private plotDot(ctx: CanvasRenderingContext2D, cx: number, cy: number, radiusMax: number, frac: number, color: string)
    {
        const θ = frac * this.maxTheta;
        const r = (radiusMax / this.maxTheta) * θ;
        const x = cx + r * Math.cos(θ);
        const y = cy + r * Math.sin(θ);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }
}  