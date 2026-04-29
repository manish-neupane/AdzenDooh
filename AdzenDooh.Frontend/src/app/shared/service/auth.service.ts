// src/app/shared/service/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ── Temp hardcoded user until real auth is built ──
  currentUser = {
    tenantId: 1,
    userId:   1
  };

}