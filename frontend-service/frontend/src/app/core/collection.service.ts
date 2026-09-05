import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Collection, Volume } from '../models/collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/v1/collections`);
  }

  search(name: string): Observable<Collection[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Collection[]>(`${this.apiUrl}/v1/collections/search`, { params });
  }

  getVolumes(collectionId: string): Observable<Volume[]> {
    return this.http.get<Volume[]>(`${this.apiUrl}/v1/collections/${collectionId}/volumes`);
  }

  delete(collectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/collections/${collectionId}`);
  }
}