import {Component, Input, ViewChild, ElementRef,AfterViewInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
interface NeckParticle {x: number; y: number; vy: number; r: number;}

@Component({selector: 'app-sand-clock', standalone: true, imports: [CommonModule],
    template: `<canvas #canvas class="sand-clock"></canvas>`, styleUrls: ['./SandClock.css']})

export class SandClockComponent implements AfterViewInit, OnDestroy
{
    @ViewChild('canvas', {static: true}) canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private particles: NeckParticle[] = [];
    private lastTs = 0;
    private raf = 0;
    private rotationCount = 0;
    private _hour = '00'; private _minute = '00';
    private _second = '00'; private _period = '';

    @Input() set hour(v: string) {if (v !== this._hour) this._hour = v;}
    @Input()
    set minute(v: string)
    {
        const old = this._minute;
        if (v !== old)
        {
            this._minute = v;
            if (old === '59' && v === '00') this.spin();
        }
    }
    @Input() set second(v: string) {if (v !== this._second) {this._second = v;}}
    @Input() set period(v: string) {if (v !== this._period) {this._period = v;}}

    constructor()
    {
        for (let i = 0; i < 100; i++)
            this.particles.push({x: (Math.random() - 0.5) * 0.8, y: Math.random(),
                vy: 0.3 + Math.random() * 0.5, r: 0.015 + Math.random() * 0.01});
    }

    ngAfterViewInit()
    {
        const c = this.canvasRef.nativeElement;
        this.ctx = c.getContext('2d')!;
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;
        this.lastTs = performance.now();
        this.raf = requestAnimationFrame(t => this.loop(t));
    }

    ngOnDestroy() {cancelAnimationFrame(this.raf);}

    private spin()
    {
        const c = this.canvasRef.nativeElement;
        this.rotationCount++;
        c.style.transition = 'transform .5s ease';
        c.style.transform = `rotate(${360 * this.rotationCount}deg)`;
        setTimeout(() => c.style.transition = '', 500);
    }

    private loop(now: number)
    {
        const dt = (now - this.lastTs) / 1000;
        this.lastTs = now;
        for (let p of this.particles)
        {
            p.y += p.vy * dt;
            if (p.y >= 1) p.y -= 1;
        }
        this.draw();
        this.raf = requestAnimationFrame(t => this.loop(t));
    }

    private draw()
    {
        const c = this.canvasRef.nativeElement;
        const ctx = this.ctx;
        const w = c.width, h = c.height;
        const cx = w / 2, cy = h / 2;
        ctx.clearRect(0, 0, w, h);

        let hh = parseInt(this._hour, 10);
        const ss = parseInt(this._second, 10);
        if (this._period === 'PM' && hh < 12) hh += 12;
        if (this._period === 'AM' && hh === 12) hh = 0;

        const fracDay = hh / 24;
        const fracSec = ss / 60;

        this.drawSky(w, h, fracDay);
        ctx.save();
        this.drawHourglass(cx, cy, Math.min(cx, cy) * 0.8, fracSec);
        ctx.restore();
    }

    private drawSky(w: number, h: number, t: number)
    {
        let c1: string, c2: string;
        if (t < 0.25) {c1 = '#0B0D17'; c2 = '#2A2F45';}
        else if (t < 0.5) {c1 = '#FF9A3C'; c2 = '#87CEEB';}
        else if (t < 0.75) {c1 = '#87CEEB'; c2 = '#FF5E5B';}
        else {c1 = '#2A2F45'; c2 = '#0B0D17';}

        const g = this.ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, w, h);
    }

    private drawHourglass(cx: number, cy: number, size: number,frac: number)
    {
        const ctx = this.ctx;
        const halfW = size * 0.3;
        const bulbH = size * 0.5;
        const neckW = size * 0.1;

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy - bulbH);
        ctx.lineTo(cx + halfW, cy - bulbH);
        ctx.lineTo(cx + neckW / 2, cy);
        ctx.lineTo(cx + halfW, cy + bulbH);
        ctx.lineTo(cx - halfW, cy + bulbH);
        ctx.lineTo(cx - neckW / 2, cy);
        ctx.closePath();
        ctx.stroke();

        const topH = (1 - frac) * bulbH;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy - bulbH);
        ctx.lineTo(cx + halfW, cy - bulbH);
        ctx.lineTo(cx + neckW / 2, cy);
        ctx.lineTo(cx - neckW / 2, cy);
        ctx.closePath();
        ctx.clip();

        const topG = ctx.createLinearGradient(0, cy - bulbH, 0, cy);
        topG.addColorStop(0, '#FFF2D0');
        topG.addColorStop(1, '#D2B48C');
        ctx.fillStyle = topG;
        ctx.fillRect(cx - halfW, (cy - bulbH) + (bulbH - topH), halfW * 2, topH);
        ctx.restore();

        const botH = frac * bulbH;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - neckW / 2, cy);
        ctx.lineTo(cx + neckW / 2, cy);
        ctx.lineTo(cx + halfW, cy + bulbH);
        ctx.lineTo(cx - halfW, cy + bulbH);
        ctx.closePath();
        ctx.clip();

        const botG = ctx.createLinearGradient(0, cy, 0, cy + bulbH);
        botG.addColorStop(0, '#D2B48C');
        botG.addColorStop(1, '#EED8AE');
        ctx.fillStyle = botG;
        ctx.fillRect(cx - halfW, cy + (bulbH - botH), halfW * 2, botH);
        ctx.restore();

        this.drawNeckParticles(cx, cy, halfW, bulbH, neckW);
    }

    private drawNeckParticles(cx: number, cy: number, halfW: number, bulbH: number,neckW: number)
    {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - neckW / 2, cy);
        ctx.lineTo(cx + neckW / 2, cy);
        ctx.lineTo(cx + halfW, cy + bulbH);
        ctx.lineTo(cx - halfW, cy + bulbH);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = 'rgba(210,180,140,0.9)';
        for (let p of this.particles)
        {
            const px = cx + p.x * neckW;
            const py = (cy - neckW * 0.5) + p.y * neckW;
            const pr = neckW * p.r;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}  