import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mustMatch } from '../../validators/must-match.validator';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('0.3s ease-out', style({ 
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ 
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ])
    ])
  ]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  showPassword = false;
  showConfirmPassword = false;

  passwordStrength = {
    score: 0,
    message: '',
    class: ''
  };

  passwordChecks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: mustMatch('password', 'confirmPassword')
    });
  }

  get f() { return this.signupForm.controls; }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  checkPasswordStrength() {
    const password = this.f['password'].value;
    
    // Check individual requirements
    this.passwordChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    let score = 0;
    Object.values(this.passwordChecks).forEach(check => {
      if (check) score++;
    });

    // Update strength message and class
    if (password.length === 0) {
      this.passwordStrength = { score: 0, message: '', class: '' };
    } else if (score <= 2) {
      this.passwordStrength = { score: 1, message: 'Weak', class: 'weak' };
    } else if (score === 3) {
      this.passwordStrength = { score: 2, message: 'Fair', class: 'fair' };
    } else if (score === 4) {
      this.passwordStrength = { score: 3, message: 'Good', class: 'good' };
    } else {
      this.passwordStrength = { score: 4, message: 'Strong', class: 'strong' };
    }
  }

  passwordStrengthValidator() {
    return (control: any) => {
      if (!control.value) return null;

      // Check all requirements
      const hasLength = control.value.length >= 8;
      const hasUpper = /[A-Z]/.test(control.value);
      const hasLower = /[a-z]/.test(control.value);
      const hasNumber = /[0-9]/.test(control.value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);

      // Calculate how many requirements are met
      const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial]
        .filter(Boolean).length;

      // Require at least 3 conditions to be met
      return score < 3 ? { 'weakPassword': true } : null;
    };
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.signup(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          this.success = 'Account pending approval. Please wait for admin verification.';
          this.loading = false;
          this.signupForm.reset();
          this.submitted = false;
        },
        error: error => {
          this.error = error.error?.message || 'An error occurred during signup';
          this.loading = false;
        }
      });
  }
} 