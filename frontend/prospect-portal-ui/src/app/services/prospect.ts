import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Prospect {

  private api = "http://localhost:8081/api/prospects";

  constructor(private http: HttpClient) {}

  getByUserId(userId: number) {
    return this.http.get(`${this.api}/by-user/${userId}`);
  }

  create(data: any) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  becomeClient(id: number) {
    return this.http.patch(`${this.api}/${id}/become-client`, {});
  }
}
