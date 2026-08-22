import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Prospect } from '../../services/prospect';
import { Auth } from '../../services/auth';
import { NotificationBell } from '../../components/notification-bell/notification-bell';
@Component({
  selector: 'app-admin-prospects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationBell],
  templateUrl: './admin-prospects.html',
  styleUrl: './admin-prospects.css'
})
export class AdminProspects implements OnInit {

  prospects: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  editingId: number | null = null;
  editForm = {
    phoneNumber: '',
    address: '',
    status: 0
  };

  deleteTarget: any = null;

  constructor(
    private prospectService: Prospect,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(){
    this.loadProspects();
  }

  loadProspects(){
    this.loading = true;
    this.prospectService.getAll().subscribe({
      next: (data: any[]) => {
        this.prospects = data.map(p => ({ ...p, userName: '...', userEmail: '' }));
        this.loading = false;
        this.enrichWithUserData();
      },
      error: () => {
        this.errorMessage = "Impossible de charger les prospects.";
        this.loading = false;
      }
    });
  }

  private enrichWithUserData(){
    this.prospects.forEach(p => {
      this.auth.getUserById(p.userId).subscribe({
        next: (user: any) => {
          p.userName = `${user.firstName} ${user.lastName}`;
          p.userEmail = user.email;
        },
        error: () => {
          p.userName = 'Utilisateur introuvable';
          p.userEmail = '—';
        }
      });
    });
  }

  get filteredProspects(){
    if (!this.searchTerm.trim()) return this.prospects;

    const term = this.searchTerm.toLowerCase();
    return this.prospects.filter(p =>
      p.userName?.toLowerCase().includes(term) ||
      p.userEmail?.toLowerCase().includes(term) ||
      p.phoneNumber?.toLowerCase().includes(term) ||
      p.address?.toLowerCase().includes(term)
    );
  }

  get countByStatus(){
    return {
      prospect: this.prospects.filter(p => p.status === 0).length,
      pending: this.prospects.filter(p => p.status === 1).length,
      client: this.prospects.filter(p => p.status === 2).length
    };
  }

  statusLabel(status: number): string {
    switch (status) {
      case 0: return 'Prospect';
      case 1: return 'En attente';
      case 2: return 'Client';
      default: return 'Inconnu';
    }
  }

  statusClass(status: number): string {
    switch (status) {
      case 0: return 'hp-badge-prospect';
      case 1: return 'hp-badge-pending';
      case 2: return 'hp-badge-client';
      default: return '';
    }
  }

  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }

  startEdit(p: any){
    this.editingId = p.id;
    this.editForm = {
      phoneNumber: p.phoneNumber || '',
      address: p.address || '',
      status: p.status
    };
  }

  cancelEdit(){
    this.editingId = null;
  }

  saveEdit(id: number){
    this.prospectService.update(id, this.editForm).subscribe({
      next: () => {
        this.editingId = null;
        this.successMessage = "Prospect mis à jour avec succès.";
        this.loadProspects();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la mise à jour.";
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  askDelete(p: any){
    this.deleteTarget = p;
  }

  cancelDelete(){
    this.deleteTarget = null;
  }

  confirmDelete(){
    if (!this.deleteTarget) return;

    const name = this.deleteTarget.userName;

    this.prospectService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.successMessage = `Prospect ${name} supprimé avec succès.`;
        this.deleteTarget = null;
        this.loadProspects();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la suppression.";
        this.deleteTarget = null;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}