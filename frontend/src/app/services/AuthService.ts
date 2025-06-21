import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {tap, catchError, finalize} from 'rxjs/operators';

export interface User {id: number; username: string; email: string; first_name: string; last_name: string; code: string;}

@Injectable({providedIn: 'root'})
export class AuthService
{
    private baseUrl = 'https://localhost:3000';
    private _userSubject = new BehaviorSubject<User | null>(null);
    public user$: Observable<User | null> = this._userSubject.asObservable();
    private _authInitialized = new BehaviorSubject<boolean>(false);
    public authInitialized$ = this._authInitialized.asObservable();
    constructor(private http: HttpClient) {this.checkSession();}

    private checkSession(): void
    {
        this.http.get<{ status: string; user?: User }>(`${this.baseUrl}/session`, {withCredentials: true})
          .pipe(tap(response =>
          {
              if (response.status === "success" && response.user)this._userSubject.next(response.user);
              else this._userSubject.next(null);
          }), catchError(err =>
          {
              console.error('Session check failed', err);
              this._userSubject.next(null);
              return of(null);
          }), finalize(() => {this._authInitialized.next(true);})).subscribe();
    }

    login(identifier: string, password: string): Observable<{status: string; message: string}>
    {
        return this.http.post<{status: string; message: string}>(`${this.baseUrl}/login`, {identifier, password},
            {withCredentials: true}).pipe(tap(response => {if (response.status === "success")this.checkSession();}));
    }  

    logout(): Observable<{status: string; message: string }>
    {
        return this.http.post<{status: string; message: string }>(`${this.baseUrl}/logout`,
            {}, {withCredentials: true}).pipe(tap(() => {this._userSubject.next(null);}));
    }

    get user(): User | null {return this._userSubject.value;}
    updateUser(user: User): void {this._userSubject.next(user);}
    isAuthenticated(): boolean {return !!this._userSubject.value;}
}