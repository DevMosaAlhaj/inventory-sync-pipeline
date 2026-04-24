import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem, SyncEvent } from './services/inventory.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private inventoryService = inject(InventoryService);
  readonly Math = Math;

  inventory = signal<InventoryItem[]>([]);
  syncEvents = signal<SyncEvent[]>([]);
  loading = signal(true);
  lastSync = signal('');
  totalSKUs = signal(0);
  healthyCount = signal(0);
  lowStockCount = signal(0);
  outOfStockCount = signal(0);
  activeTab = signal<'inventory' | 'events'>('inventory');

  ngOnInit(): void {
    this.inventoryService.getInventory().subscribe(items => {
      this.inventory.set(items);
      this.loading.set(false);
    });

    this.inventoryService.getSyncEvents().subscribe(events => {
      this.syncEvents.set(events);
    });

    this.inventoryService.getStats().subscribe(stats => {
      this.totalSKUs.set(stats.total);
      this.healthyCount.set(stats.healthy);
      this.lowStockCount.set(stats.low);
      this.outOfStockCount.set(stats.outOfStock);
      this.lastSync.set(stats.lastSync);
    });
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  setTab(tab: 'inventory' | 'events'): void {
    this.activeTab.set(tab);
  }
}
