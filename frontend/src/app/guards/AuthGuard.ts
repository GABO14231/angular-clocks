import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/AuthService';
import {Observable} from 'rxjs';
import {filter, map, take, switchMap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate
{
    constructor(private auth: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree>
    {
        return this.auth.authInitialized$.pipe(filter(initialized => initialized === true),
            take(1), switchMap(() => this.auth.user$), take(1),
            map(user => {return user ? true : this.router.createUrlTree(['/login']);}));
    }
}