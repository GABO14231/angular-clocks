import {Component, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef} from '@angular/core';
import {DigitalClockComponent} from '../clocks/Digital/DigitalClock';

@Component({selector: 'app-clock-switcher', template: "<ng-container #clockContainer></ng-container>", standalone: true})

export class ClockSwitcherComponent implements OnChanges
{
    @Input() activeClockType: string = '';
    @Input() digitalTime: string = '';
    @ViewChild('clockContainer', { read: ViewContainerRef, static: true })
    clockContainer!: ViewContainerRef;

    private componentMap: { [key: string]: any } =
    {
        'Digital Clock': DigitalClockComponent,
    };

    private currentComponentRef: any;

    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['activeClockType']) this.loadComponent();
        if (this.currentComponentRef && changes['digitalTime'])
        {
            if (this.currentComponentRef.instance.hasOwnProperty('time'))
            {
                this.currentComponentRef.instance.time = this.digitalTime;
                this.currentComponentRef.changeDetectorRef.detectChanges();
            }
        }
    }

    private loadComponent(): void
    {
        this.clockContainer.clear();
        const componentType = this.componentMap[this.activeClockType];
        if (componentType)
        {
            this.currentComponentRef = this.clockContainer.createComponent(componentType);
            if (this.currentComponentRef.instance.hasOwnProperty('time'))
            {
                this.currentComponentRef.instance.time = this.digitalTime;
                this.currentComponentRef.changeDetectorRef.detectChanges();
            }
        }
    }
}