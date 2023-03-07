import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}

  public getAgrovocKeywords(): string[] {
    // TODO implement real logic; read from file; replace dummy string array
    return [
      'Aal',
      'Aaptosyax grypus',
      'Aasfresser',
      'Ab-Hof-Preis',
      'Ab-Hof-Verkauf',
      'ABA',
      'ABAG',
      'Abaka',
      'Abalistes stellaris',
      'Abalone',
      'Abamectin',
      'Abbau',
      'Abbau (Bergbau)',
      'Abbaubarkeit im Pansen',
      'Abbottina rivularis',
      'Abbrennen der Stoppeln',
      'Abdeckereiprodukt',
      'Abdeckindustrie',
      'Abdomen',
      'Abdrift',
      'Abelmoschus',
      'Abelmoschus esculentus',
      'Abelmoschus moschatus',
      'Aberia',
      'Abessinien',
      'Abessinischer Senf',
      'Abfall',
      'Abfallbehandlung',
    ];
  }
}
