import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bucket } from 'src/app/shared/model/bucket';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BucketService {
  constructor(private http: HttpClient) {}

  public getAll(): Observable<Bucket[]> {
    return this.http.get<Bucket[]>(environment.backend.url + '/buckets');
  }

  public getAssetsByBucketName(name: string): Observable<CoopSpace | null> {
    // TODO getAssets by Bucket Name

    return of({
      id: 1,
      name: name,
      mandant: 'mgrave',
      company: 'Claas',
      members: [
        { username: 'jende', role: CoopSpaceRole.Viewer } as Member,
        { username: 'alopez', role: CoopSpaceRole.Viewer } as Member,
      ],
      role: CoopSpaceRole.Editor,
    } as CoopSpace);
  }
}
