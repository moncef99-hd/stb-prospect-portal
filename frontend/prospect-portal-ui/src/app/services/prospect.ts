import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Prospect {

  private api = "http://localhost:8081/api/prospects";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.api);
  }

  getByUserId(userId: number) {
    return this.http.get(`${this.api}/by-user/${userId}`);
  }

  create(data: any) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  becomeClient(id: number) {
    return this.http.patch(`${this.api}/${id}/become-client`, {});
  }
}