import {Component, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-analog-clock', standalone: true, imports: [CommonModule],
    template: `<canvas #clockCanvas></canvas>`, styleUrl: './AnalogClock.css'})

export class AnalogClockComponent implements AfterViewInit
{
    @ViewChild('clockCanvas', {static: true}) canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private _hour: string = '00';
    private _minute: string = '00';
    private _second: string = '00';
    private _period: string = '';

    @Input()
    set hour(value: string) {if (this._hour !== value) {this._hour = value; this.drawClock();}}
    @Input()
    set minute(value: string) {if (this._minute !== value) {this._minute = value; this.drawClock();}}
    @Input()
    set second(value: string) {if (this._second !== value) {this._second = value; this.drawClock();}}
    @Input()
    set period(value: string) {if (this._period !== value) {this._period = value; this.drawClock();}}

    constructor() {}

    ngAfterViewInit(): void
    {
        const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this.drawClock();
    }

    private drawClock(): void
    {
        if (!this.ctx) return;

        const canvas = this.canvasRef.nativeElement;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.85;

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#1f2023';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 8;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.04, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();

        for (let i = 0; i < 12; i++)
        {
            const angle = (i * 30 * Math.PI) / 180;
            this.ctx.beginPath();
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.moveTo(centerX + Math.cos(angle) * radius * 0.9, centerY + Math.sin(angle) * radius * 0.9);
            this.ctx.lineTo(centerX + Math.cos(angle) * radius * 0.8, centerY + Math.sin(angle) * radius * 0.8);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        for (let i = 0; i < 60; i++)
        {
            if (i % 5 !== 0)
            {
                const angle = (i * 6 * Math.PI) / 180;
                this.ctx.beginPath();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.moveTo(centerX + Math.cos(angle) * radius * 0.95, centerY + Math.sin(angle) * radius * 0.95);
                this.ctx.lineTo(centerX + Math.cos(angle) * radius * 0.9, centerY + Math.sin(angle) * radius * 0.9);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }

        this.ctx.font = `${radius * 0.15}px Arial`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 1; i <= 12; i++)
        {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            const textX = centerX + Math.cos(angle) * radius * 0.7;
            const textY = centerY + Math.sin(angle) * radius * 0.7;
            this.ctx.fillText(i.toString(), textX, textY);
        }

        let currentHours = parseInt(this._hour, 10);
        const currentMinutes = parseInt(this._minute, 10);
        const currentSeconds = parseInt(this._second, 10);

        if (this._period === 'PM' && currentHours < 12) currentHours += 12;
        else if (this._period === 'AM' && currentHours === 12) currentHours = 0;

        const secondAngle = ((currentSeconds * 6) - 90) * Math.PI / 180;
        const minuteAngle = ((currentMinutes * 6) + (currentSeconds * 0.1) - 90) * Math.PI / 180;
        const hourAngle = ((currentHours % 12 * 30) + (currentMinutes * 0.5) + (currentSeconds * (0.5 / 60)) - 90) * Math.PI / 180;

        this.drawHand(centerX, centerY, hourAngle, radius * 0.5, radius * 0.03, '#4A90E2');
        this.drawHand(centerX, centerY, minuteAngle, radius * 0.75, radius * 0.02, '#00ff00');
        this.drawHand(centerX, centerY, secondAngle, radius * 0.8, radius * 0.01, '#f00');
    }

    private drawHand(x: number, y: number, angle: number, length: number, width: number, color: string): void
    {
        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;

        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(length, 0);
        this.ctx.stroke();
        this.ctx.rotate(-angle);
        this.ctx.translate(-x, -y);
        this.ctx.closePath();
    }
}