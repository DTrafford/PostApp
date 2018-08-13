import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { User } from './user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable()
export class AuthService {
  private token: string;
  private isAuthenticated = false;
  private userId: string;
  private displayName: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private dNameListener = new Subject<string>();
  private userIdListener = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  getUserIdListener() {
    return this.userIdListener.asObservable();
  }

  getDisplayName() {
    return this.displayName;
  }
  getDNameListener() {
    return this.dNameListener.asObservable();
  }

  createUser(displayName: string, email: string, password: string) {
    const user: User = {
      id: null,
      displayName: displayName,
      email: email,
      password: password
    };
    return this.http.post(BACKEND_URL + '/signup', user)
    .subscribe(response => {
      console.log(response);
      this.router.navigate(['/auth/login']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  logIn(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http.post<{token: string,
                    userId: string,
                    displayName: string,
                    expiresIn: number}>(BACKEND_URL + '/login', authData)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.userId = response.userId;
        this.displayName = response.displayName;
        this.dNameListener.next(response.displayName);
        // Auto logout after timeout
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, this.displayName, this.userId);
        console.log(this.userId);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  autoAuthenticateUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.displayName = authInformation.displayName;
      this.dNameListener.next(authInformation.displayName); // Maybe remove
      this.userId = authInformation.userId;
      this.userIdListener.next(authInformation.userId); // Maybe remove
    }
  }

  logOut() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.displayName = null;
    this.dNameListener.next(null);
    this.userId = null;
    this.userIdListener.next(null);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer to:' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration * 1000);
  }
  private saveAuthData(token: string, expirationDate: Date, displayName: string, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('user', displayName);
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const displayName = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    if (!token && !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      displayName: displayName,
      userId: userId
    };
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  }
}
