import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div *ngIf="toast" class="toast-container">
      <div class="toast-backdrop"></div>
      <div [class]="'toast ' + toast.type">
        <div class="toast-content">
          <i class="fas" [class]="getIcon()"></i>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      pointer-events: none;
    }

    .toast-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      animation: fadeIn 0.3s ease-out;
    }

    .toast {
      position: relative;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-content i {
      font-size: 24px;
    }

    .toast-content span {
      font-size: 16px;
      font-weight: 500;
    }

    .success {
      background-color: #4CAF50;
      color: white;
    }

    .error {
      background-color: #F44336;
      color: white;
    }

    .info {
      background-color: #2196F3;
      color: white;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  private subscription: Subscription | null = null;
  private timeout: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.showToast(toast);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  getIcon(): string {
    if (!this.toast) return '';
    switch (this.toast.type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'info':
        return 'fa-info-circle';
      default:
        return '';
    }
  }

  private showToast(toast: Toast) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.toast = toast;
    
    this.timeout = setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
} 