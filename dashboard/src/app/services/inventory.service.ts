import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface InventoryItem {
  sku: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  lastUpdated: string;
  status: 'healthy' | 'low' | 'out-of-stock';
}

export interface SyncEvent {
  id: string;
  type: 'order_decrement' | 'sheets_sync' | 'shopify_update';
  sku: string;
  productName: string;
  quantityChange: number;
  timestamp: string;
  source: 'shopify' | 'google-sheets';
}

export interface DailySummary {
  date: string;
  totalSKUs: number;
  outOfStock: number;
  lowStockCount: number;
  lowStockItems: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private useMock = true;
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getInventory(): Observable<InventoryItem[]> {
    if (this.useMock) return of(this.getMockInventory());
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`).pipe(
      catchError(() => of(this.getMockInventory()))
    );
  }

  getSyncEvents(): Observable<SyncEvent[]> {
    if (this.useMock) return of(this.getMockEvents());
    return this.http.get<SyncEvent[]>(`${this.apiUrl}/sync-events`).pipe(
      catchError(() => of(this.getMockEvents()))
    );
  }

  getDailySummary(): Observable<DailySummary> {
    if (this.useMock) return of(this.getMockSummary());
    return this.http.get<DailySummary>(`${this.apiUrl}/daily-summary`).pipe(
      catchError(() => of(this.getMockSummary()))
    );
  }

  getStats(): Observable<{ total: number; healthy: number; low: number; outOfStock: number; lastSync: string }> {
    return this.getInventory().pipe(
      map(items => {
        const low = items.filter(i => i.status === 'low').length;
        const outOfStock = items.filter(i => i.status === 'out-of-stock').length;
        return {
          total: items.length,
          healthy: items.length - low - outOfStock,
          low,
          outOfStock,
          lastSync: new Date().toISOString()
        };
      })
    );
  }

  private getMockInventory(): InventoryItem[] {
    const now = new Date().toISOString();
    return [
      { sku: 'SKU-1001', productName: 'Wireless Bluetooth Headphones', currentStock: 45, reorderLevel: 10, lastUpdated: now, status: 'healthy' },
      { sku: 'SKU-1002', productName: 'USB-C Charging Cable (3ft)', currentStock: 8, reorderLevel: 15, lastUpdated: now, status: 'low' },
      { sku: 'SKU-1003', productName: 'Laptop Stand - Adjustable', currentStock: 0, reorderLevel: 5, lastUpdated: now, status: 'out-of-stock' },
      { sku: 'SKU-1004', productName: 'Mechanical Keyboard - RGB', currentStock: 32, reorderLevel: 10, lastUpdated: now, status: 'healthy' },
      { sku: 'SKU-1005', productName: 'Wireless Mouse - Ergonomic', currentStock: 3, reorderLevel: 10, lastUpdated: now, status: 'low' },
      { sku: 'SKU-1006', productName: 'Monitor Arm - Dual Mount', currentStock: 18, reorderLevel: 5, lastUpdated: now, status: 'healthy' },
      { sku: 'SKU-1007', productName: 'Desk Pad - XXL (35x17in)', currentStock: 67, reorderLevel: 10, lastUpdated: now, status: 'healthy' },
      { sku: 'SKU-1008', productName: 'Webcam HD 1080p', currentStock: 2, reorderLevel: 8, lastUpdated: now, status: 'low' },
      { sku: 'SKU-1009', productName: 'Portable SSD 1TB', currentStock: 24, reorderLevel: 10, lastUpdated: now, status: 'healthy' },
      { sku: 'SKU-1010', productName: 'USB Hub - 7 Port', currentStock: 0, reorderLevel: 5, lastUpdated: now, status: 'out-of-stock' },
    ];
  }

  private getMockEvents(): SyncEvent[] {
    const now = new Date();
    return [
      { id: '1', type: 'order_decrement', sku: 'SKU-1001', productName: 'Wireless Bluetooth Headphones', quantityChange: -2, timestamp: new Date(now.getTime() - 300000).toISOString(), source: 'shopify' },
      { id: '2', type: 'sheets_sync', sku: 'SKU-1004', productName: 'Mechanical Keyboard - RGB', quantityChange: 10, timestamp: new Date(now.getTime() - 900000).toISOString(), source: 'google-sheets' },
      { id: '3', type: 'order_decrement', sku: 'SKU-1002', productName: 'USB-C Charging Cable (3ft)', quantityChange: -5, timestamp: new Date(now.getTime() - 1800000).toISOString(), source: 'shopify' },
      { id: '4', type: 'shopify_update', sku: 'SKU-1005', productName: 'Wireless Mouse - Ergonomic', quantityChange: 20, timestamp: new Date(now.getTime() - 3600000).toISOString(), source: 'google-sheets' },
      { id: '5', type: 'order_decrement', sku: 'SKU-1008', productName: 'Webcam HD 1080p', quantityChange: -3, timestamp: new Date(now.getTime() - 5400000).toISOString(), source: 'shopify' },
      { id: '6', type: 'order_decrement', sku: 'SKU-1009', productName: 'Portable SSD 1TB', quantityChange: -1, timestamp: new Date(now.getTime() - 7200000).toISOString(), source: 'shopify' },
      { id: '7', type: 'sheets_sync', sku: 'SKU-1006', productName: 'Monitor Arm - Dual Mount', quantityChange: 5, timestamp: new Date(now.getTime() - 9000000).toISOString(), source: 'google-sheets' },
    ];
  }

  private getMockSummary(): DailySummary {
    return {
      date: new Date().toISOString().split('T')[0],
      totalSKUs: 10,
      outOfStock: 2,
      lowStockCount: 3,
      lowStockItems: '- USB-C Charging Cable (SKU-1002): 8 units\n- Wireless Mouse (SKU-1005): 3 units\n- Webcam HD 1080p (SKU-1008): 2 units'
    };
  }
}
