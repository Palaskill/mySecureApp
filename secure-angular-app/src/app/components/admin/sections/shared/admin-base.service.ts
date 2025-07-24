import { Injectable } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminBaseService {
  constructor(
    protected adminService: AdminService,
    protected toastService: ToastService
  ) {}

  protected handleError(operation: string, errorMessage?: string) {
    return (error: any): Observable<never> => {
      console.error(`Error ${operation}:`, error);
      this.toastService.showError(errorMessage || `Failed to ${operation}`);
      return throwError(() => error);
    };
  }

  protected handleSuccess(operation: string, successMessage?: string) {
    return tap(() => {
      this.toastService.showSuccess(successMessage || `${operation} successful`);
    });
  }
} 