import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FinanceService, Summary, Transaction, Category } from '../../services/finance.service';

export interface ChartSegment {
  name: string;
  color: string;
  amount: number;
  percentage: number;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private financeService = inject(FinanceService);
  private router = inject(Router);

  user = JSON.parse(localStorage.getItem('user') || '{}');
  summary: Summary = { initialBalance: 0, totalIncome: 0, totalExpenses: 0, currentBalance: 0 };
  transactions: Transaction[] = [];
  categories: Category[] = [];

  showTransactionModal = false;
  showBalanceModal = false;
  showCategoryModal = false;

  transactionForm = { type: 'expense', amount: null as number | null, description: '', categoryId: null as number | null };
  newBalance: number | null = null;
  newCategory = { name: '', color: '#00b894' };

  loading = false;
  errorMsg = '';

  readonly COLORS = [
    '#00b894', '#0984e3', '#6c5ce7', '#e17055',
    '#fdcb6e', '#fd79a8', '#636e72', '#d63031',
  ];

  // SVG donut: r=70, stroke-width=32, circumference ≈ 439.82
  private readonly C = 2 * Math.PI * 70;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.financeService.getSummary().subscribe({ next: (s) => (this.summary = s) });
    this.financeService.getTransactions().subscribe({ next: (t) => (this.transactions = t) });
    this.financeService.getCategories().subscribe({ next: (c) => (this.categories = c) });
  }

  get chartSegments(): ChartSegment[] {
    const total = +this.summary.totalExpenses;
    if (!total) return [];

    const expMap = new Map<string, { color: string; amount: number }>();
    for (const t of this.transactions) {
      if (t.type !== 'expense') continue;
      const key = t.category?.name || 'Sin categoría';
      const color = t.category?.color || '#b2bec3';
      const prev = expMap.get(key);
      expMap.set(key, { color, amount: (prev?.amount ?? 0) + +t.amount });
    }

    const segments: ChartSegment[] = [];
    let cumulative = 0;
    for (const [name, data] of expMap) {
      const pct = (data.amount / total) * 100;
      const len = (pct / 100) * this.C;
      const gap = this.C - len;
      segments.push({
        name,
        color: data.color,
        amount: data.amount,
        percentage: Math.round(pct),
        dashArray: `${len} ${gap}`,
        dashOffset: this.C - cumulative,
      });
      cumulative += len;
    }
    return segments;
  }

  get hasExpenses(): boolean {
    return +this.summary.totalExpenses > 0;
  }

  formatShort(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }

  openModal(type: 'income' | 'expense') {
    this.transactionForm = { type, amount: null, description: '', categoryId: null };
    this.errorMsg = '';
    this.showTransactionModal = true;
  }

  saveTransaction() {
    if (!this.transactionForm.amount || this.transactionForm.amount <= 0) {
      this.errorMsg = 'Ingresa un monto válido';
      return;
    }
    this.loading = true;
    this.financeService
      .createTransaction({
        amount: this.transactionForm.amount,
        type: this.transactionForm.type,
        description: this.transactionForm.description || undefined,
        categoryId: this.transactionForm.categoryId || undefined,
      })
      .subscribe({
        next: () => {
          this.showTransactionModal = false;
          this.loading = false;
          this.loadData();
        },
        error: () => {
          this.errorMsg = 'Error al guardar';
          this.loading = false;
        },
      });
  }

  deleteTransaction(id: number) {
    this.financeService.deleteTransaction(id).subscribe({ next: () => this.loadData() });
  }

  saveInitialBalance() {
    if (this.newBalance === null || this.newBalance < 0) {
      this.errorMsg = 'Ingresa un saldo válido';
      return;
    }
    this.loading = true;
    this.financeService.setInitialBalance(this.newBalance).subscribe({
      next: () => {
        this.showBalanceModal = false;
        this.loading = false;
        this.loadData();
      },
      error: () => {
        this.errorMsg = 'Error al guardar';
        this.loading = false;
      },
    });
  }

  saveCategory() {
    if (!this.newCategory.name.trim()) {
      this.errorMsg = 'Ingresa un nombre';
      return;
    }
    this.loading = true;
    this.financeService.createCategory(this.newCategory).subscribe({
      next: () => {
        this.showCategoryModal = false;
        this.newCategory = { name: '', color: '#00b894' };
        this.loading = false;
        this.financeService.getCategories().subscribe({ next: (c) => (this.categories = c) });
      },
      error: () => {
        this.errorMsg = 'Error al guardar';
        this.loading = false;
      },
    });
  }

  openBalanceModal() {
    this.newBalance = this.summary.initialBalance || null;
    this.errorMsg = '';
    this.showBalanceModal = true;
  }

  openCategoryModal() {
    this.newCategory = { name: '', color: '#00b894' };
    this.errorMsg = '';
    this.showCategoryModal = true;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  getCategoryName(t: Transaction): string {
    return t.category?.name || 'Sin categoría';
  }

  getCategoryColor(t: Transaction): string {
    return t.category?.color || '#b2bec3';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
