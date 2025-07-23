import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    console.log('ToastService: showing success message:', message);
    this.toastSubject.next({
      message,
      type: 'success'
    });
  }

  showError(message: string) {
    console.log('ToastService: showing error message:', message);
    this.toastSubject.next({
      message,
      type: 'error'
    });
  }

  showInfo(message: string) {
    console.log('ToastService: showing info message:', message);
    this.toastSubject.next({
      message,
      type: 'info'
    });
  }
} 