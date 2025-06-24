import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavbarComponent} from '../../components/Navbar/Navbar';
import {TimeControlsComponent} from '../../components/TimeControls/TimeControls';
import {AuthService} from '../../services/AuthService';
import {Subscription} from 'rxjs';

export interface NavbarOption
{
    label: string;
    path?: string;
    method?: () => void;
}

@Component({selector: 'app-dashboard', standalone: true, imports: [NavbarComponent, TimeControlsComponent],
    templateUrl: './ClockDashboard.html', styleUrls: ['./ClockDashboard.css']})

export class ClockDashboardPage implements OnInit, OnDestroy
{
    user: any = null;
    dashboardOptions = [{label: "Home", path: "/"}, {label: "Settings", path: "/profile"},
        {label: "Logout", path: "/", method: () => this.handleLogout()}];
    userSub!: Subscription;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {this.userSub = this.authService.user$.subscribe(u => this.user = u);}
    ngOnDestroy(): void {if (this.userSub) this.userSub.unsubscribe();}

    handleLogout(): void
    {
        this.authService.logout().subscribe({next: response => console.log("Logged out:", response.message),
            error: err => console.error(err)});
    }
}