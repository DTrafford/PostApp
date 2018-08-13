import { AbstractControl } from '@angular/forms';
import { Observable, Observer, EMPTY, of } from 'rxjs';

export const mimeType = (control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => {

  if (!control.value || typeof(control.value) === 'string') {
    return EMPTY;
  }
  if (typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create((oberver: Observer<{[key: string]: any}>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result).subarray(0, 4);
      let header = '';
      let isValid = false;
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      switch (header) {
        case '89504e47':
          isValid = true;
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }
      if (isValid) {
        oberver.next(null);
      } else {
        oberver.next({invalidFileType: true });
      }
      oberver.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return frObs;
};
