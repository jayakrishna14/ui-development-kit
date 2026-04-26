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
import { MatMenuModule } from '@angular/material/menu';

import { SailPointSDKService } from '../sailpoint-sdk.service';
import { WorkflowDetailsDialogComponent } from './workflow-details-dialog.component';
import { WorkflowJsonDialogComponent } from './workflow-json-dialog.component';
import { WorkflowDeleteDialogComponent } from './workflow-delete-dialog.component';

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
    MatMenuModule,
    WorkflowDetailsDialogComponent,
    WorkflowJsonDialogComponent,
    WorkflowDeleteDialogComponent
  ],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss'
})
export class WorkflowsComponent implements OnInit, AfterViewInit {

  title = 'Workflow Manager';

  displayedColumns: string[] = ['select', 'name', 'owner', 'type', 'description', 'size', 'stepsCount', 'enabled', 'executionCount', 'actions'];
  allColumns: string[] = ['select', 'name', 'owner', 'modifiedBy', 'type', 'description', 'size', 'stepsCount', 'enabled', 'executionCount', 'created', 'modified', 'actions'];
  selectedColumns = new Set(this.displayedColumns);
  dataSource = new MatTableDataSource<any>([]);

  selectedWorkflows = new Set<string>();

  loading = false;
  error = false;
  errorMessage = '';
  workflowForJsonUpdate: any = null;

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
    this.setupFilterPredicate();
    this.attachTableFeatures();
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'owner': return this.getOwnerName(item).toLowerCase();
        case 'modifiedBy': return this.getModifiedByName(item).toLowerCase();
        case 'type': return this.getTriggerType(item).toLowerCase();
        case 'name': return item.name || '';
        case 'description': return item.description || '';
        case 'size': return this.getDefinitionSize(item);
        case 'stepsCount': return this.getStepCount(item);
        case 'enabled': return item.enabled ? 1 : 0;
        case 'executionCount': return item.executionCount || 0;
        case 'created': return item.created || '';
        case 'modified': return item.modified || '';
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
        (data.id && data.id.toLowerCase().includes(searchStr)) ||
        (this.getTriggerType(data).toLowerCase().includes(searchStr)) ||
        (data.owner?.name && data.owner.name.toLowerCase().includes(searchStr)) ||
        (data.owner?.id && data.owner.id.toLowerCase().includes(searchStr)) ||
        (this.getModifiedByName(data).toLowerCase().includes(searchStr))
      );
    };
  }

  async loadWorkflows(): Promise<void> {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    try {
      const data = await this.loadAllWorkflows();

      this.dataSource.data = data;
      this.selectedWorkflows.clear();
      setTimeout(() => this.attachTableFeatures());
    } catch (err: any) {
      console.error('Workflow load failed:', err);
      this.error = true;
      this.errorMessage = err?.response?.data?.message || err?.message || 'Failed to load workflows';
      this.dataSource.data = [];
    } finally {
      this.loading = false;
    }
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  get enabledCount(): number {
    return this.dataSource.data.filter((workflow: any) => workflow.enabled).length;
  }

  get disabledCount(): number {
    return this.dataSource.data.length - this.enabledCount;
  }

  getOwnerName(workflow: any): string {
    return workflow?.owner?.name || workflow?.owner?.id || '—';
  }

  getModifiedByName(workflow: any): string {
    return workflow?.modifiedBy?.name || workflow?.modifiedBy?.id || '—';
  }

  formatTimestamp(value: string | undefined): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  getTriggerType(workflow: any): string {
    const attributes = this.getTriggerAttributes(workflow);
    if (attributes === null || attributes === undefined) {
      return workflow?.trigger?.displayName || workflow?.trigger?.type || '—';
    }
    if (typeof attributes === 'string') {
      return attributes;
    }
    if (typeof attributes === 'number' || typeof attributes === 'boolean') {
      return String(attributes);
    }
    if (typeof attributes === 'object') {
      return attributes.displayName
        || attributes.name
        || attributes.type
        || attributes.id
        || JSON.stringify(attributes);
    }
    return '—';
  }

  getStepCount(workflow: any): number {
    const definition = workflow?.definition || workflow;
    if (Array.isArray(definition?.steps)) {
      return definition.steps.length;
    }
    if (definition?.steps && typeof definition.steps === 'object') {
      return Object.keys(definition.steps).length;
    }
    if (Array.isArray(definition?.nodes)) {
      return definition.nodes.length;
    }
    if (Array.isArray(workflow?.steps)) {
      return workflow.steps.length;
    }
    return 0;
  }

  getDefinitionSize(workflow: any): string {
    if (!workflow?.definition) {
      return '—';
    }

    try {
      const json = JSON.stringify(workflow.definition);
      const bytes = new TextEncoder().encode(json).length;
      return this.formatBytes(bytes);
    } catch {
      return '—';
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    const confirmed = await this.confirmDelete({
      title: 'Delete workflow',
      message: `Delete "${name}"? This action cannot be undone.`,
      detail: 'Enabled workflows cannot be deleted. Disable first if this request fails.'
    });
    if (!confirmed) {
      return;
    }

    this.loading = true;
    try {
      await this.sdk.deleteWorkflow({ id });
      this.showMessage(`Workflow "${name}" deleted successfully`, 'success');
      await this.loadWorkflows();
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

    const confirmed = await this.confirmDelete({
      title: 'Delete selected workflows',
      message: `Delete ${this.selectedWorkflows.size} selected workflow(s)? This action cannot be undone.`,
      detail: 'This is a high-risk operation and each selected workflow will be deleted.'
    });
    if (!confirmed) {
      return;
    }

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

      await this.loadWorkflows();
    } catch (err: any) {
      this.showMessage('Failed to delete workflows', 'error');
      console.error('Error in bulk delete:', err);
    } finally {
      this.loading = false;
    }
  }

  createWorkflow(): void {
    this.openWorkflowJsonDialog({
      title: 'Create workflow',
      subtitle: 'Paste or edit a workflow JSON body, then create it in the tenant.',
      actionLabel: 'Create workflow',
      actionIcon: 'add_circle',
      icon: 'add_circle',
      jsonText: JSON.stringify(this.getStarterWorkflow(), null, 2)
    });
  }

  importWorkflow(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.openWorkflowJsonDialog({
        title: 'Import workflow JSON',
        subtitle: 'Review the imported JSON before creating a new workflow.',
        actionLabel: 'Import workflow',
        actionIcon: 'upload_file',
        icon: 'upload_file',
        jsonText: String(reader.result || '')
      });
    };
    reader.onerror = () => this.showMessage('Failed to read workflow JSON file', 'error');
    reader.readAsText(file);
  }

  private openWorkflowJsonDialog(data: any, onSubmit?: (workflow: any) => Promise<void>): void {
    const dialogRef = this.dialog.open(WorkflowJsonDialogComponent, {
      width: '900px',
      maxHeight: '92vh',
      data
    });

    dialogRef.afterClosed().subscribe(async workflow => {
      if (!workflow) {
        return;
      }
      await (onSubmit ? onSubmit(workflow) : this.createWorkflowFromBody(workflow));
    });
  }

  private async createWorkflowFromBody(workflow: any): Promise<void> {
    this.loading = true;
    try {
      const body = this.cleanWorkflowForCreate(workflow);
      await this.sdk.createWorkflow({ createWorkflowRequestV2025: body });
      this.showMessage(`Workflow "${body.name || 'new workflow'}" created`, 'success');
      await this.loadWorkflows();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create workflow';
      this.showMessage(message, 'error');
      console.error('Create workflow failed:', err);
    } finally {
      this.loading = false;
    }
  }

  viewWorkflow(workflow: any): void {
    const dialogRef = this.dialog.open(WorkflowDetailsDialogComponent, {
      width: '1180px',
      maxWidth: '96vw',
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

  downloadWorkflow(workflow: any): void {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.getSafeFileName(workflow?.name || workflow?.id || 'workflow')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  prepareWorkflowJsonUpdate(workflow: any, input: HTMLInputElement): void {
    this.workflowForJsonUpdate = workflow;
    input.click();
  }

  importWorkflowUpdate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const workflow = this.workflowForJsonUpdate;
    input.value = '';
    this.workflowForJsonUpdate = null;

    if (!file || !workflow) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.openWorkflowJsonDialog({
        title: 'Update workflow from JSON',
        subtitle: `Review JSON before patching "${workflow.name || workflow.id}".`,
        actionLabel: 'Patch workflow',
        actionIcon: 'published_with_changes',
        icon: 'published_with_changes',
        jsonText: String(reader.result || '')
      }, importedWorkflow => this.patchWorkflowFromBody(workflow, importedWorkflow));
    };
    reader.onerror = () => this.showMessage('Failed to read workflow JSON file', 'error');
    reader.readAsText(file);
  }

  getStatusLabel(enabled: boolean): string {
    return enabled ? 'Enabled' : 'Disabled';
  }

  getStatusColor(enabled: boolean): string {
    return enabled ? 'accent' : 'warn';
  }

  private async patchWorkflowFromBody(targetWorkflow: any, importedWorkflow: any): Promise<void> {
    if (!targetWorkflow?.id) {
      this.showMessage('Cannot update: workflow ID is missing', 'error');
      return;
    }

    this.loading = true;
    try {
      const body = this.cleanWorkflowBody(importedWorkflow);
      const patchOps = this.buildReplacePatch(body);
      if (patchOps.length === 0) {
        this.showMessage('No patchable workflow fields found in JSON', 'warning');
        return;
      }

      await this.sdk.patchWorkflow({
        id: targetWorkflow.id,
        jsonPatchOperationV2025: patchOps
      });
      this.showMessage(`Workflow "${targetWorkflow.name || targetWorkflow.id}" updated`, 'success');
      await this.loadWorkflows();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update workflow';
      this.showMessage(message, 'error');
      console.error('Workflow update import failed:', err);
    } finally {
      this.loading = false;
    }
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
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private hasItems(value: unknown): value is { items: any[] } {
    return typeof value === 'object'
      && value !== null
      && Array.isArray((value as { items?: unknown }).items);
  }

  private confirmDelete(data: any): Promise<boolean> {
    const dialogRef = this.dialog.open(WorkflowDeleteDialogComponent, {
      width: '500px',
      data
    });
    return new Promise(resolve => {
      dialogRef.afterClosed().subscribe(result => resolve(result === true));
    });
  }

  private getTriggerAttributes(workflow: any): any {
    const trigger = workflow?.trigger;
    return trigger?.EVENT?.attributes
      ?? trigger?.Event?.attributes
      ?? trigger?.event?.attributes
      ?? trigger?.attributes;
  }

  private async loadAllWorkflows(): Promise<any[]> {
    const limit = 250;
    let offset = 0;
    const workflows: any[] = [];

    while (true) {
      const res = await this.sdk.listWorkflows({ limit, offset });
      const page = this.extractWorkflows(res);
      workflows.push(...page);

      if (page.length < limit) {
        break;
      }
      offset += limit;
    }

    return workflows;
  }

  private extractWorkflows(response: unknown): any[] {
    const responseData: unknown = (response as { data?: unknown })?.data ?? response;
    return Array.isArray(responseData)
      ? responseData
      : this.hasItems(responseData)
        ? responseData.items
        : [];
  }

  private cleanWorkflowForCreate(workflow: any): any {
    const body = this.cleanWorkflowBody(workflow);
    return {
      ...body,
      enabled: body.enabled === true ? false : body.enabled
    };
  }

  private cleanWorkflowBody(workflow: any): any {
    const { id, created, modified, modifiedBy, creator, executionCount, failureCount, ...body } = workflow;
    return body;
  }

  private buildReplacePatch(workflow: any): any[] {
    const allowedFields = ['name', 'owner', 'description', 'enabled', 'definition', 'trigger'];
    return allowedFields
      .filter(field => Object.prototype.hasOwnProperty.call(workflow, field))
      .map(field => ({ op: 'replace', path: `/${field}`, value: workflow[field] }));
  }

  private getSafeFileName(value: string): string {
    return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'workflow';
  }

  private getStarterWorkflow(): any {
    return {
      name: 'New Workflow',
      description: 'Describe what this workflow does.',
      definition: {
        start: 'success',
        steps: {
          success: {
            type: 'success'
          }
        }
      },
      enabled: false,
      trigger: {
        type: 'EVENT',
        attributes: {
          id: 'idn:identity-attributes-changed'
        }
      }
    };
  }

  toggleColumn(column: string): void {
    if (this.selectedColumns.has(column)) {
      this.selectedColumns.delete(column);
    } else {
      this.selectedColumns.add(column);
    }

    this.displayedColumns = this.allColumns.filter(c => this.selectedColumns.has(c));
  }

  formatColumnName(column: string): string {
    const mapping: Record<string, string> = {
      select: 'Select',
      name: 'Name',
      owner: 'Owner',
      modifiedBy: 'Updated By',
      type: 'Type',
      description: 'Description',
      size: 'Size',
      stepsCount: 'Steps',
      enabled: 'Status',
      executionCount: 'Executions',
      created: 'Created',
      modified: 'Updated',
      actions: 'Actions'
    };

    return mapping[column] || column;
  }

}
