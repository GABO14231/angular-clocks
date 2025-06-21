import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavbarComponent} from '../../components/Navbar/Navbar';
import {AuthService} from '../../services/AuthService';
import {Subscription} from 'rxjs';

export interface NavbarOption
{
    label: string;
    path?: string;
    method?: () => void;
}

@Component({selector: 'app-home', standalone: true, imports: [NavbarComponent], templateUrl: './Home.html',
    styleUrls: ['./Home.css']})

export class Home implements OnInit, OnDestroy
{
    user: any = null;
    homeOptions: NavbarOption[] = [];
    userSub!: Subscription;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {this.userSub = this.authService.user$.subscribe(u => {this.user = u; this.setHomeOptions();});}
    ngOnDestroy(): void {if (this.userSub) this.userSub.unsubscribe();}

    handleLogout(): void
    {
        console.log("Logging out...");
        this.authService.logout().subscribe({next: response => {console.log(response.message);},
            error: err => console.error(err)});
    }

    setHomeOptions(): void
    {
        if (this.user)
            this.homeOptions = [{label: "Clocks", path: "/"},
                {label: "Settings", path: "/profile"},
                {label: "Logout", path: "/", method: this.handleLogout.bind(this)}];
        else this.homeOptions = [{label: "Login", path: "/login"}, {label: "Register", path: "/register"}];
    }
}