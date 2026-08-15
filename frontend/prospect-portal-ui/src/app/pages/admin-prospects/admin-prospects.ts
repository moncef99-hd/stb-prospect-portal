import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prospect } from '../../services/prospect';

@Component({
  selector: 'app-admin-prospects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-prospects.html',
  styleUrl: './admin-prospects.css'
})
export class AdminProspects implements OnInit {

  prospects: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  editingId: number | null = null;
  editForm = {
    phoneNumber: '',
    address: '',
    status: 0
  };

  showCreateForm = false;
  creating = false;
  createForm = {
    userId: null as number | null,
    phoneNumber: '',
    address: ''
  };
  createError = '';

  constructor(private prospectService: Prospect) {}

  ngOnInit(){
    this.loadProspects();
  }

  loadProspects(){
    this.loading = true;
    this.prospectService.getAll().subscribe({
      next: (data: any) => {
        this.prospects = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Impossible de charger les prospects.";
        this.loading = false;
      }
    });
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

  // ---------- CREATE ----------

  toggleCreateForm(){
    this.showCreateForm = !this.showCreateForm;
    this.createError = '';
    this.createForm = { userId: null, phoneNumber: '', address: '' };
  }

  submitCreate(){
    this.createError = '';

    if (!this.createForm.userId) {
      this.createError = "Le User ID est obligatoire.";
      return;
    }

    this.creating = true;

    this.prospectService.create(this.createForm).subscribe({
      next: () => {
        this.creating = false;
        this.showCreateForm = false;
        this.successMessage = "Prospect créé avec succès.";
        this.loadProspects();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.creating = false;
        this.createError = err?.error?.message || "Erreur lors de la création (User ID peut-être déjà utilisé).";
      }
    });
  }

  // ---------- UPDATE ----------

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
        this.successMessage = "Prospect mis à jour.";
        this.loadProspects();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la mise à jour.";
      }
    });
  }

  // ---------- DELETE ----------

  deleteProspect(id: number){
    if (!confirm('Supprimer définitivement ce prospect ?')) return;

    this.prospectService.delete(id).subscribe({
      next: () => {
        this.successMessage = "Prospect supprimé.";
        this.loadProspects();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la suppression.";
      }
    });
  }
}