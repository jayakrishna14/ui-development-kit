import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SailPointSDKService } from '../sailpoint-sdk.service';
import { WorkflowDetailsDialogComponent } from './workflow-details-dialog.component';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    WorkflowDetailsDialogComponent
  ],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss'
})
export class WorkflowsComponent implements OnInit, AfterViewInit {

  title = 'Workflow Executions';

displayedColumns: string[] = ['select', 'name', 'type', 'description', 'enabled', 'executionCount', 'actions'];  dataSource = new MatTableDataSource<any>([]);

  selectedWorkflows = new Set<string>();

  loading = false;
  error = false;
  errorMessage = '';
allColumns: string[] = ['select', 'name', 'type', 'description', 'enabled', 'executionCount', 'actions'];
selectedColumns = new Set(this.allColumns);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private sdk: SailPointSDKService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  ngAfterViewInit(): void {
   this.attachTableFeatures();
this.setupFilterPredicate();
    this.setupFilterPredicate();
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
  switch (property) {
    case 'type': return item.trigger?.type || '';
    case 'name': return item.name || '';
    case 'description': return item.description || '';
    case 'enabled': return item.enabled ? 1 : 0;
    case 'executionCount': return item.executionCount || 0;
    default: return item[property];
  }
};
  }

  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.name && data.name.toLowerCase().includes(searchStr)) ||
        (data.description && data.description.toLowerCase().includes(searchStr)) ||
        (data.id && data.id.toLowerCase().includes(searchStr))
      );
    };
  }

  async loadWorkflows(): Promise<void> {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    try {
      const res = await this.sdk.listWorkflows();
      
      // Handle both direct data and nested response structure
      let workflows: any[] = [];
      if (res && res.data) {
        workflows = Array.isArray(res.data) ? res.data : [res.data];
      } else if (Array.isArray(res)) {
        workflows = res;
      }
      
      // Ensure we have valid workflow data
      workflows = workflows.filter(w => w && typeof w === 'object');
      this.dataSource.data = workflows;
      // 🔥 FIX: reattach after data load
setTimeout(() => this.attachTableFeatures());
      if (workflows.length === 0) {
        this.showMessage('No workflows found', 'info');
      }
    } catch (err: any) {
      console.error('Error loading workflows:', err);
      this.error = true;
      this.errorMessage = err?.message || 'Failed to load workflows. Please try again.';
      this.showMessage(this.errorMessage, 'error');
    } finally {
      this.loading = false;
    }
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim();
  }

  toggleSelection(id: string): void {
    if (this.selectedWorkflows.has(id)) {
      this.selectedWorkflows.delete(id);
    } else {
      this.selectedWorkflows.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedWorkflows.has(id);
  }

  async deleteWorkflow(id: string, name: string): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete workflow "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.loading = true;
    try {
      await this.sdk.deleteWorkflow({ id });
      this.showMessage(`Workflow "${name}" deleted successfully`, 'success');
      this.loadWorkflows();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete workflow';
      this.showMessage(message, 'error');
      console.error('Error deleting workflow:', err);
    } finally {
      this.loading = false;
    }
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedWorkflows.size === 0) {
      this.showMessage('Please select at least one workflow to delete', 'warning');
      return;
    }

    const confirmed = confirm(
      `Delete ${this.selectedWorkflows.size} workflow(s)? This action cannot be undone.`
    );
    if (!confirmed) return;

    this.loading = true;
    let successCount = 0;
    let failureCount = 0;

    try {
      const deletePromises = Array.from(this.selectedWorkflows).map(id =>
        this.sdk.deleteWorkflow({ id })
          .then(() => {
            successCount++;
          })
          .catch(err => {
            failureCount++;
            console.error(`Failed to delete workflow ${id}:`, err);
          })
      );

      await Promise.all(deletePromises);

      this.selectedWorkflows.clear();
      
      if (successCount > 0) {
        this.showMessage(
          `Successfully deleted ${successCount} workflow(s)${failureCount > 0 ? `. ${failureCount} failed.` : ''}`,
          failureCount > 0 ? 'warning' : 'success'
        );
      }
      
      if (failureCount === 0) {
        this.loadWorkflows();
      }
    } catch (err: any) {
      this.showMessage('Failed to delete workflows', 'error');
      console.error('Error in bulk delete:', err);
    } finally {
      this.loading = false;
    }
  }

  viewWorkflow(workflow: any): void {
    const dialogRef = this.dialog.open(WorkflowDetailsDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: workflow
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'saved') {
        this.showMessage('Workflow updated successfully', 'success');
        this.loadWorkflows();
      }
    });
  }

  getStatusLabel(enabled: boolean): string {
    return enabled ? 'Enabled' : 'Disabled';
  }

  getStatusColor(enabled: boolean): string {
    return enabled ? 'accent' : 'warn';
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const duration = type === 'error' ? 5000 : 3000;
    const panelClass = `snackbar-${type}`;
    
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass
    });
  }
  private attachTableFeatures(): void {
  if (this.sort) this.dataSource.sort = this.sort;
  if (this.paginator) this.dataSource.paginator = this.paginator;
}
toggleColumn(column: string) {
  if (this.selectedColumns.has(column)) {
    this.selectedColumns.delete(column);
  } else {
    this.selectedColumns.add(column);
  }

  this.displayedColumns = this.allColumns.filter(c => this.selectedColumns.has(c));
}
}