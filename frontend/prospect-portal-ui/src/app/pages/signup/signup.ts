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

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  register() {
    this.errorMessage = "";

    if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.password) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    }

    this.loading = true;

    this.auth.register(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || "Une erreur est survenue, réessayez.";
      }
    });
  }
}