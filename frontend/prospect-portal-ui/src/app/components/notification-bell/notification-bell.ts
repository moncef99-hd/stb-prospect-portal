import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationApi } from '../../services/notification';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css'
})
export class NotificationBell implements OnInit, OnDestroy {

  notifications: any[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;

  private pollSub?: Subscription;

  constructor(private notifApi: NotificationApi) {}

  ngOnInit(){
    this.loadUnreadCount();

    // Rafraichit le compteur toutes les 10 secondes
    this.pollSub = interval(10000).subscribe(() => {
      this.loadUnreadCount();
    });
  }

  ngOnDestroy(){
    this.pollSub?.unsubscribe();
  }

  loadUnreadCount(){
    this.notifApi.getUnreadCount().subscribe({
      next: (data) => this.unreadCount = data.count,
      error: () => {}
    });
  }

  toggleDropdown(){
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(){
    this.loading = true;
    this.notifApi.getAll().subscribe({
      next: (data) => {
        this.notifications = data.slice(0, 8); // les 8 plus récentes
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notif: any, event: Event){
    event.stopPropagation();
    if (notif.isRead) return;

    this.notifApi.markAsRead(notif.id).subscribe({
      next: () => {
        notif.isRead = true;
        this.loadUnreadCount();
      }
    });
  }

  markAllAsRead(){
    this.notifApi.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `Il y a ${diffD}j`;
  }
}
