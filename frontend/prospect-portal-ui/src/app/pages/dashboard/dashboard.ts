import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Prospect } from '../../services/prospect';

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
  prospect: any = null;

  daysSinceSignup = 0;
  memberSince = '';

  becomingClient = false;
  becomeClientError = '';

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
    private prospectService: Prospect,
    private router: Router
  ) {}

  ngOnInit(){
    this.auth.me().subscribe({
      next: (userData: any) => {
        this.user = userData;
        this.computeDates(userData.createdAt);
        this.loadOrCreateProspect(userData.id);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  private computeDates(createdAt: string){
    if (!createdAt) return;

    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    this.daysSinceSignup = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    this.memberSince = created.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private loadOrCreateProspect(userId: number){
    this.prospectService.getByUserId(userId).subscribe({
      next: (data: any) => {
        this.prospect = data;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.createProspect(userId);
        } else {
          this.loading = false;
        }
      }
    });
  }

  private createProspect(userId: number){
    const payload = {
      userId: userId,
      phoneNumber: "",
      address: ""
    };

    this.prospectService.create(payload).subscribe({
      next: (data: any) => {
        this.prospect = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get statusLabel(): string {
    if (!this.prospect) return 'Prospect';

    switch (this.prospect.status) {
      case 0: return 'Prospect';
      case 1: return 'Demande en cours';
      case 2: return 'Client';
      default: return 'Prospect';
    }
  }

  get isPending(): boolean {
    return this.prospect?.status === 1;
  }

  get isClient(): boolean {
    return this.prospect?.status === 2;
  }

  get canBecomeClient(): boolean {
    return this.prospect && this.prospect.status === 0;
  }

  becomeClient(){
    if (!this.prospect || !this.canBecomeClient) return;

    this.becomingClient = true;
    this.becomeClientError = '';

    this.prospectService.becomeClient(this.prospect.id).subscribe({
      next: (data: any) => {
        this.prospect = data;
        this.becomingClient = false;
      },
      error: () => {
        this.becomingClient = false;
        this.becomeClientError = "Impossible de traiter votre demande. Réessayez plus tard.";
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