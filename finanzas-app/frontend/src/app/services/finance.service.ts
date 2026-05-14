import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: Category | null;
  createdAt: string;
}

export interface Summary {
  initialBalance: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.api}/transactions/summary`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.api}/transactions`);
  }

  createTransaction(data: {
    amount: number;
    type: string;
    description?: string;
    categoryId?: number;
  }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.api}/transactions`, data);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/transactions/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  createCategory(data: { name: string; color: string }): Observable<Category> {
    return this.http.post<Category>(`${this.api}/categories`, data);
  }

  setInitialBalance(amount: number): Observable<any> {
    return this.http.put(`${this.api}/users/me/balance`, { initialBalance: amount });
  }
}
