import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class Auth {


  private api =
  "http://localhost:5014/api/auth";


  constructor(
    private http: HttpClient
  ){}



  register(data:any){

    return this.http.post(
      `${this.api}/register`,
      data
    );

  }



  login(data:any){

    return this.http.post<any>(
      `${this.api}/login`,
      data
    );

  }



  saveToken(token:string){

    localStorage.setItem(
      "token",
      token
    );

  }



  me(){

    return this.http.get(
      `${this.api}/me`
    );

  }
logout(){
  localStorage.removeItem("token");
}

getToken(){
  return localStorage.getItem("token");
}

}