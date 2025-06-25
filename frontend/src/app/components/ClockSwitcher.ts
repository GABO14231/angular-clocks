import {Component, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef} from '@angular/core';
import {DigitalClockComponent} from '../clocks/Digital/DigitalClock';
import {AnalogClockComponent} from '../clocks/Analog/AnalogClock';
export interface ParsedTime {hour: string; minute: string; second: string; period: string;}

@Component({selector: 'app-clock-switcher', template: "<ng-container #clockContainer></ng-container>", standalone: true})

export class ClockSwitcherComponent implements OnChanges
{
    @Input() activeClockType: string = '';
    @Input() digitalTime: string = '';
    @ViewChild('clockContainer', { read: ViewContainerRef, static: true })
    clockContainer!: ViewContainerRef;
    private parsedTimeData: ParsedTime = {hour: '', minute: '', second: '', period: ''};

    private componentMap: { [key: string]: any } =
    {
        'Digital Clock': DigitalClockComponent,
        'Analog Clock': AnalogClockComponent,
    };

    private currentComponentRef: any;

    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['digitalTime'])
        {
            this.parsedTimeData = this.parseTimeString(this.digitalTime);
            if (this.currentComponentRef) this.updateComponentTimeInputs();
        }
        if (changes['activeClockType']) this.loadComponent();
    }

    private parseTimeString(timeString: string): ParsedTime
    {
        let clean = timeString.replace(/\s+/g, ' ').trim();
        let parts = clean.split(':');

        if (parts.length < 3) return {hour: '', minute: '', second: '', period: ''};

        let hour = parts[0].trim();
        let minute = parts[1].trim();
        let secAndPeriod = parts[2].trim().split(' ');
        let second = secAndPeriod[0];
        let period = secAndPeriod[1] || '';

        return {hour, minute, second, period};
    }

    private loadComponent(): void
    {
        this.clockContainer.clear();
        const componentType = this.componentMap[this.activeClockType];
        if (componentType)
        {
            this.currentComponentRef = this.clockContainer.createComponent(componentType);
            this.updateComponentTimeInputs();
        }
    }

    private updateComponentTimeInputs(): void
    {
        const inst = this.currentComponentRef.instance;
        (inst as any).time = this.digitalTime;
        (inst as any).hour = this.parsedTimeData.hour;
        (inst as any).minute = this.parsedTimeData.minute;
        (inst as any).second = this.parsedTimeData.second;
        (inst as any).period = this.parsedTimeData.period;
        this.currentComponentRef.changeDetectorRef.detectChanges();
    }
}