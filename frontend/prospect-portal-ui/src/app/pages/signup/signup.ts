import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  user = {
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  };

  showPassword = false;
  loading = false;
  errorMessage = "";
  showSuccess = false;

  strength = 0;
  strengthLabel = "";

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  checkStrength(){
    const pwd = this.user.password;
    let score = 0;

    if (pwd.length >= 6) score++;
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (pwd.length >= 10 && /[^A-Za-z0-9]/.test(pwd)) score++;

    this.strength = score;

    if (score <= 1) this.strengthLabel = "Faible";
    else if (score === 2) this.strengthLabel = "Moyen";
    else this.strengthLabel = "Fort";
  }

  private validate(): string | null {
    const { firstName, lastName, email, password } = this.user;

    if (!firstName.trim()) {
      return "Le prénom est obligatoire.";
    }

    if (firstName.trim().length < 2) {
      return "Le prénom doit contenir au moins 2 caractères.";
    }

    if (!lastName.trim()) {
      return "Le nom est obligatoire.";
    }

    if (lastName.trim().length < 2) {
      return "Le nom doit contenir au moins 2 caractères.";
    }

    if (!email.trim()) {
      return "L'adresse email est obligatoire.";
    }

    if (!this.emailRegex.test(email.trim())) {
      return "Format d'email invalide. Exemple : nom@domaine.com";
    }

    if (!password) {
      return "Le mot de passe est obligatoire.";
    }

    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
    }

    return null;
  }

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  register() {
    this.errorMessage = "";

    const validationError = this.validate();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;

    const payload = {
      firstName: this.user.firstName.trim(),
      lastName: this.user.lastName.trim(),
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1600);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 409) {
          this.errorMessage = "Cette adresse email est déjà utilisée.";
        } else if (err.status === 400) {
          this.errorMessage = err?.error?.message || "Données invalides, vérifiez le formulaire.";
        } else if (err.status === 0) {
          this.errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else {
          this.errorMessage = "Une erreur est survenue, veuillez réessayer.";
        }
      }
    });
  }
}