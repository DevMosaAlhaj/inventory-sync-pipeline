import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface InventoryItem {
  sku: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  lastUpdated: string;
  status: 'healthy' | 'low' | 'out-of-stock';
}

interface SyncEvent {
  id: string;
  type: 'order_decrement' | 'sheets_sync' | 'shopify_update';
  sku: string;
  productName: string;
  quantityChange: number;
  timestamp: string;
  source: 'shopify' | 'google-sheets';
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  inventory = signal<InventoryItem[]>([]);
  syncEvents = signal<SyncEvent[]>([]);
  loading = signal(true);
  lastSync = signal<string>('');
  totalSKUs = signal(0);
  lowStockCount = signal(0);
  outOfStockCount = signal(0);
  activeTab = signal<'inventory' | 'events'>('inventory');

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockInventory: InventoryItem[] = [
      { sku: 'SKU-1001', productName: 'Wireless Bluetooth Headphones', currentStock: 45, reorderLevel: 10, lastUpdated: new Date().toISOString(), status: 'healthy' },
      { sku: 'SKU-1002', productName: 'USB-C Charging Cable (3ft)', currentStock: 8, reorderLevel: 15, lastUpdated: new Date().toISOString(), status: 'low' },
      { sku: 'SKU-1003', productName: 'Laptop Stand - Adjustable', currentStock: 0, reorderLevel: 5, lastUpdated: new Date().toISOString(), status: 'out-of-stock' },
      { sku: 'SKU-1004', productName: 'Mechanical Keyboard - RGB', currentStock: 32, reorderLevel: 10, lastUpdated: new Date().toISOString(), status: 'healthy' },
      { sku: 'SKU-1005', productName: 'Wireless Mouse - Ergonomic', currentStock: 3, reorderLevel: 10, lastUpdated: new Date().toISOString(), status: 'low' },
      { sku: 'SKU-1006', productName: 'Monitor Arm - Dual Mount', currentStock: 18, reorderLevel: 5, lastUpdated: new Date().toISOString(), status: 'healthy' },
      { sku: 'SKU-1007', productName: 'Desk Pad - XXL (35x17in)', currentStock: 67, reorderLevel: 10, lastUpdated: new Date().toISOString(), status: 'healthy' },
      { sku: 'SKU-1008', productName: 'Webcam HD 1080p', currentStock: 2, reorderLevel: 8, lastUpdated: new Date().toISOString(), status: 'low' },
      { sku: 'SKU-1009', productName: 'Portable SSD 1TB', currentStock: 24, reorderLevel: 10, lastUpdated: new Date().toISOString(), status: 'healthy' },
      { sku: 'SKU-1010', productName: 'USB Hub - 7 Port', currentStock: 0, reorderLevel: 5, lastUpdated: new Date().toISOString(), status: 'out-of-stock' },
    ];

    const now = new Date();
    const mockEvents: SyncEvent[] = [
      { id: '1', type: 'order_decrement', sku: 'SKU-1001', productName: 'Wireless Bluetooth Headphones', quantityChange: -2, timestamp: new Date(now.getTime() - 300000).toISOString(), source: 'shopify' },
      { id: '2', type: 'sheets_sync', sku: 'SKU-1004', productName: 'Mechanical Keyboard - RGB', quantityChange: 10, timestamp: new Date(now.getTime() - 900000).toISOString(), source: 'google-sheets' },
      { id: '3', type: 'order_decrement', sku: 'SKU-1002', productName: 'USB-C Charging Cable (3ft)', quantityChange: -5, timestamp: new Date(now.getTime() - 1800000).toISOString(), source: 'shopify' },
      { id: '4', type: 'shopify_update', sku: 'SKU-1005', productName: 'Wireless Mouse - Ergonomic', quantityChange: 20, timestamp: new Date(now.getTime() - 3600000).toISOString(), source: 'google-sheets' },
      { id: '5', type: 'order_decrement', sku: 'SKU-1008', productName: 'Webcam HD 1080p', quantityChange: -3, timestamp: new Date(now.getTime() - 5400000).toISOString(), source: 'shopify' },
    ];

    this.inventory.set(mockInventory);
    this.syncEvents.set(mockEvents);
    this.lastSync.set(new Date().toISOString());
    this.totalSKUs.set(mockInventory.length);
    this.lowStockCount.set(mockInventory.filter(i => i.status === 'low').length);
    this.outOfStockCount.set(mockInventory.filter(i => i.status === 'out-of-stock').length);
    this.loading.set(false);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/20 text-emerald-400';
      case 'low': return 'bg-amber-500/20 text-amber-400';
      case 'out-of-stock': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'order_decrement': return '🛒';
      case 'sheets_sync': return '📊';
      case 'shopify_update': return '🔄';
      default: return '📝';
    }
  }

  getEventLabel(type: string): string {
    switch (type) {
      case 'order_decrement': return 'Order Decrement';
      case 'sheets_sync': return 'Sheets → Shopify';
      case 'shopify_update': return 'Shopify Update';
      default: return 'Sync';
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  setTab(tab: 'inventory' | 'events'): void {
    this.activeTab.set(tab);
  }
}
