import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationApi {

  private api = "http://localhost:8082/api/notifications";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.api}/unread-count`);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.api}/${id}/mark-as-read`, {});
  }

  markAllAsRead() {
    return this.http.patch(`${this.api}/mark-all-as-read`, {});
  }
}
