import {Component, Input, HostListener, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
export interface NavbarOption {label: string; path?: string; method?: () => boolean | void}

@Component({selector: 'app-navbar', standalone: true, imports: [CommonModule, RouterModule],
    templateUrl: './Navbar.html', styleUrl: './Navbar.css'})

export class NavbarComponent implements OnInit
{
    @Input() options: NavbarOption[] = [];
    isVisible = true;
    isHome = false;
    private lastScrollY = 0;

    constructor(private router: Router) {}

    ngOnInit(): void
    {
        this.lastScrollY = window.scrollY;
        this.checkRoute();
        this.router.events.subscribe(() => this.checkRoute());
    }
    checkRoute(): void {this.isHome = this.router.url === '/';}

    @HostListener('window:scroll', [])
    onWindowScroll(): void
    {
        this.isVisible = window.scrollY <= this.lastScrollY;
        this.lastScrollY = window.scrollY;
    }

    handleClick(option: NavbarOption, event: Event): void
    {
        if (option.method)
        {
            const result = option.method();
            if (!option.path || result === false) event.preventDefault();
        }
    }
}