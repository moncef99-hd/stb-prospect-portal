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

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  private validate(): string | null {
    if (!this.user.email.trim()) {
      return "L'adresse email est obligatoire.";
    }

    if (!this.emailRegex.test(this.user.email.trim())) {
      return "Format d'email invalide. Exemple : nom@domaine.com";
    }

    if (!this.user.password) {
      return "Le mot de passe est obligatoire.";
    }

    return null;
  }

  login() {
    this.errorMessage = "";

    const validationError = this.validate();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;

    const payload = {
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password
    };

    this.auth.login(payload).subscribe({
      next: (response: any) => {
        this.auth.saveToken(response.token);

        this.auth.me().subscribe({
          next: (userData: any) => {
            this.loading = false;
            if (userData.role === 'Admin') {
              this.router.navigate(['/admin/prospects']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = "Email ou mot de passe incorrect.";
        } else if (err.status === 404) {
          this.errorMessage = "Aucun compte trouvé avec cet email.";
        } else if (err.status === 0) {
          this.errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else {
          this.errorMessage = "Une erreur est survenue, veuillez réessayer.";
        }
      }
    });
  }
}