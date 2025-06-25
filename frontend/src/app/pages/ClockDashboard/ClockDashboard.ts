import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavbarComponent} from '../../components/Navbar/Navbar';
import {TimeControlsComponent} from '../../components/TimeControls/TimeControls';
import {ClockMenu, MenuOption} from '../../components/ClockMenu/ClockMenu';
import {ClockSwitcherComponent} from '../../components/ClockSwitcher'
import {AuthService} from '../../services/AuthService';
import {Subscription} from 'rxjs';

@Component({selector: 'app-dashboard', standalone: true,
    imports: [NavbarComponent, TimeControlsComponent, ClockMenu, ClockSwitcherComponent, CommonModule],
    templateUrl: './ClockDashboard.html', styleUrl: './ClockDashboard.css'})

export class ClockDashboardPage implements OnInit, AfterViewInit, OnDestroy
{
    user: any = null;
    dashboardOptions = [{label: "Home", path: "/"}, {label: "Settings", path: "/profile"},
        {label: "Logout", path: "/", method: () => this.handleLogout()}];
    userSub!: Subscription;
    menuOptions: MenuOption[] =
    [
        {label: 'Digital Clock', action: () => this.setActiveClock("Digital Clock")},
        {label: 'Analog Clock', action: () => this.setActiveClock("Analog Clock")},
        {label: 'Sand Clock', action: () => this.setActiveClock("Sand Clock")},
        {label: 'Binary-LED Clock', action: () => this.setActiveClock("Binary-LED Clock")},
        {label: 'Morse Clock', action: () => this.setActiveClock("Morse Clock")},
        {label: 'Fibonacci Clock', action: () => this.setActiveClock("Fibonacci Clock")},
        {label: 'Color Pulse Clock', action: () => this.setActiveClock("Color Pulse Clock")},
        {label: 'Spiral Clock', action: () => this.setActiveClock("Spiral Clock")},
        {label: 'Gear Clock', action: () => this.setActiveClock("Gear Clock")},
        {label: 'Word Clock', action: () => this.setActiveClock("Word Clock")}
    ];

    activeClockLabel: string = "Select a time visualization from the menu";
    digitalTime: string = "";
    showTimeControls: boolean = false;
    @ViewChild(TimeControlsComponent) timeControls!: TimeControlsComponent;
    private timerInterval: any;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {this.userSub = this.authService.user$.subscribe(u => (this.user = u));}

    ngAfterViewInit(): void
    {
        this.timerInterval = setInterval(() =>
        {
            if (this.timeControls) this.digitalTime = this.timeControls.formattedTime;
        }, 1000);
    }

    ngOnDestroy(): void
    {
        if (this.userSub) this.userSub.unsubscribe();
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    handleLogout(): void
    {
        this.authService.logout().subscribe({next: response => console.log("Logged out:", response.message),
            error: err => console.error(err)});
    }

    setActiveClock(clockLabel: string): void {this.activeClockLabel = clockLabel;}
    handleMenuSelection(option: MenuOption): void {option.action();}
    toggleTimeControls(): void {this.showTimeControls = !this.showTimeControls;}
}