import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  user = {
    email: "",
    password: ""
  };

  showPassword = false;
  loading = false;
  errorMessage = "";

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  login() {
    this.errorMessage = "";
    this.loading = true;

    this.auth.login(this.user).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.auth.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = "Email ou mot de passe incorrect.";
      }
    });
  }
}