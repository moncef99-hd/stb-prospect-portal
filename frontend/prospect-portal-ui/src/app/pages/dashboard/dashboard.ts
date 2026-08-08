import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  loading = true;
  user: any = null;
  daysSinceSignup = 0;
  memberSince = '';

  services = [
    { icon: '💳', name: 'Carte bancaire', desc: 'Demandez votre carte Visa ou Mastercard STB.' },
    { icon: '🏦', name: 'Compte courant', desc: 'Ouvrez un compte courant en quelques clics.' },
    { icon: '💰', name: 'Épargne', desc: 'Faites fructifier votre argent avec nos livrets.' },
    { icon: '📈', name: 'Crédit', desc: 'Simulez et demandez un crédit personnalisé.' },
    { icon: '🛡️', name: 'Assurance', desc: 'Protégez ce qui compte le plus pour vous.' },
    { icon: '📱', name: 'Banque mobile', desc: 'Gérez vos finances depuis votre téléphone.' },
  ];

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(){
    this.auth.me().subscribe({
      next: (data: any) => {
        this.user = data;
        this.loading = false;

        if (data.createdAt) {
          const created = new Date(data.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - created.getTime();
          this.daysSinceSignup = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

          this.memberSince = created.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  get initials(){
    if (!this.user) return '';
    return (this.user.firstName?.[0] || '') + (this.user.lastName?.[0] || '');
  }

  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}