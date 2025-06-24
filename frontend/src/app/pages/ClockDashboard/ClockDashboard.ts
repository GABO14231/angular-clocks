import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavbarComponent} from '../../components/Navbar/Navbar';
import {TimeControlsComponent} from '../../components/TimeControls/TimeControls';
import {ClockMenu, MenuOption} from '../../components/ClockMenu/ClockMenu';
import {AuthService} from '../../services/AuthService';
import {Subscription} from 'rxjs';

export interface NavbarOption
{
    label: string;
    path?: string;
    method?: () => void;
}

@Component({selector: 'app-dashboard', standalone: true, imports: [NavbarComponent, TimeControlsComponent, ClockMenu],
    templateUrl: './ClockDashboard.html', styleUrls: ['./ClockDashboard.css']})

export class ClockDashboardPage implements OnInit, OnDestroy
{
    user: any = null;
    dashboardOptions = [{label: "Home", path: "/"}, {label: "Settings", path: "/profile"},
        {label: "Logout", path: "/", method: () => this.handleLogout()}];
    userSub!: Subscription;
    menuOptions = [{label: 'Option 1', action: () => console.log("Action for Option 1 executed")},
        {label: 'Option 2', action: () => console.log("Action for Option 2 executed")}];

    constructor(private authService: AuthService) {}

    ngOnInit(): void {this.userSub = this.authService.user$.subscribe(u => this.user = u);}
    ngOnDestroy(): void {if (this.userSub) this.userSub.unsubscribe();}
    handleMenuSelection(option: MenuOption) {console.log('User selected', option.label);}

    handleLogout(): void
    {
        this.authService.logout().subscribe({next: response => console.log("Logged out:", response.message),
            error: err => console.error(err)});
    }
}