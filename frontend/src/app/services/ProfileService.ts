import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ProfileService
{
    private baseUrl = 'https://localhost:3000';
    constructor(private http: HttpClient) {}

    registerUser(input: any): Observable<any>
    {
        const url = `${this.baseUrl}/users/register`;
        return this.http.post(url, input, {headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'});
    }

    loadProfile(form: any, profileData: any): Observable<any>
    {
        const url = `${this.baseUrl}/users/${profileData.id}`;
        return this.http.put(url, form, {headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,observe: 'response'});
    }

    updateCode(id: any): Observable<any>
    {
        const url = `${this.baseUrl}/users/${id}/updatecode`;
        return this.http.put(url, {id}, {headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true, observe: 'response'});
    }

    recoverPassword(code: string, newPassword: string): Observable<any>
    {
        const url = `${this.baseUrl}/recoverpass`;
        return this.http.put(url, {code, newPassword}, {headers: new HttpHeaders({'Content-Type': 'application/json'}),
            withCredentials: true, observe: 'response'});
    }

    deleteProfile(password: string, id: any): Observable<any>
    {
        const url = `${this.baseUrl}/users/${id}`;
        return this.http.request('delete', url,
        {
            body: {password}, headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,observe: 'response'
        });
    }
}