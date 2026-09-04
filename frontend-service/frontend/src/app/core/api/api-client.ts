import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl || '/api';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError = {
      message: 'An unknown error occurred',
      status: error.status,
    };

    if (error.error instanceof ErrorEvent) {
      apiError.message = `Network error: ${error.error.message}`;
      apiError.code = 'NETWORK_ERROR';
    } else {
      apiError.message = error.error?.message || error.message || `HTTP Error ${error.status}`;
      apiError.code = error.error?.code;
      apiError.details = error.error?.details;
    }

    return throwError(() => apiError);
  }

  get<T>(url: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}${url}`, {
      headers: this.getHeaders(),
      params: httpParams,
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<T>(`${this.baseUrl}${url}`, formData, {
      reportProgress: !!onProgress,
      observe: onProgress ? 'events' : 'body',
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}