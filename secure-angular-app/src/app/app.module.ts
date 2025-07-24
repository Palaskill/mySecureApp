import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { ToastComponent } from './components/toast/toast.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ExistingUsersComponent } from './components/admin/sections/existing-users/existing-users.component';
import { PendingSignupsComponent } from './components/admin/sections/pending-signups/pending-signups.component';
import { RejectedAccountsComponent } from './components/admin/sections/rejected-accounts/rejected-accounts.component';
import { DeletedAccountsComponent } from './components/admin/sections/deleted-accounts/deleted-accounts.component';
import { SidenavComponent } from './components/admin/sidenav/sidenav.component';
import { PasswordChangeDialogComponent } from './components/admin/dialogs/password-change-dialog/password-change-dialog.component';
import { RoleSelectionDialogComponent } from './components/admin/dialogs/role-selection-dialog/role-selection-dialog.component';
import { DeleteConfirmationDialogComponent } from './components/admin/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    AdminDashboardComponent,
    ToastComponent,
    ExistingUsersComponent,
    PendingSignupsComponent,
    RejectedAccountsComponent,
    DeletedAccountsComponent,
    SidenavComponent,
    PasswordChangeDialogComponent,
    RoleSelectionDialogComponent,
    DeleteConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
