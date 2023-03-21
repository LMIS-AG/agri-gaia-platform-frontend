import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  public getAgrovocKeywordsFromFile(): Observable<string> {
    const filePath = 'assets/agrovoc/agrovoc_keywords_de.txt';

    return this.http.get(filePath, { responseType: 'text' });
  }
}
