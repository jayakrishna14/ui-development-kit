import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SailPointSDKService } from '../sailpoint-sdk.service';
@Component({
  selector: 'app-workflow-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data?.name || 'Workflow Details' }}</h2>
      </div>

      <mat-tab-group>
        <!-- VIEW TAB -->
        <mat-tab label="Details">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">info</mat-icon>
            Details
          </ng-template>
          
          <div class="tab-content">
            <div *ngIf="!editMode" class="view-mode">
              <div class="info-grid">
                <div class="info-item">
                  <label>ID:</label>
                  <code>{{ data?.id || '—' }}</code>
                </div>
                
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ data?.name || '—' }}</span>
                </div>

                <div class="info-item">
                  <label>Description:</label>
                  <span>{{ data?.description || '—' }}</span>
                </div>

                <div class="info-item">
                  <label>Status:</label>
                  <span [ngClass]="data?.enabled ? 'enabled-text' : 'disabled-text'">
                    {{ data?.enabled ? '✓ Enabled' : '✗ Disabled' }}
                  </span>
                </div>

                <div class="info-item">
                  <label>Created:</label>
                  <span>{{ data?.created ? (data.created | date:'medium') : '—' }}</span>
                </div>

                <div class="info-item">
                  <label>Modified:</label>
                  <span>{{ data?.modified ? (data.modified | date:'medium') : '—' }}</span>
                </div>

                <div class="info-item">
                  <label>Executions:</label>
                  <span>{{ data?.executionCount || 0 }}</span>
                </div>
              

                <div class="info-item">
                  <label>Failures:</label>
                  <span class="failure-count">{{ data?.failureCount || 0 }}</span>
                </div>

                <div class="info-item">
                  <label>Steps:</label>
                  <span>{{ getStepCount(data) }}</span>
                </div>

                <div class="info-item">
                  <label>Definition size:</label>
                  <span>{{ getDefinitionSize(data) }}</span>
                </div>

                <div class="info-item full-width" *ngIf="data?.owner">
                  <label>Owner:</label>
                  <span>{{ data?.owner?.name || data?.owner?.id || '—' }}</span>
                </div>

                <div class="info-item full-width" *ngIf="data?.creator">
                  <label>Created By:</label>
                  <span>{{ data?.creator?.name || '—' }}</span>
                </div>

                <div class="info-item full-width" *ngIf="data?.modifiedBy">
                  <label>Modified By:</label>
                  <span>{{ data?.modifiedBy?.name || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- EDIT MODE -->
            <div *ngIf="editMode" class="edit-mode">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="editData.name" placeholder="Workflow name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput [(ngModel)]="editData.description" rows="4" placeholder="Workflow description"></textarea>
              </mat-form-field>
            </div>
          </div>
        </mat-tab>

        <!-- JSON TAB -->
        <mat-tab label="JSON">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">code</mat-icon>
            JSON
          </ng-template>
          
          <div class="tab-content">
            <div *ngIf="!editMode" class="json-view">
              <pre>{{ jsonText }}</pre>
            </div>

            <div *ngIf="editMode" class="json-edit">
              <textarea [(ngModel)]="jsonText" class="json-editor"></textarea>
            </div>
          </div>
        </mat-tab>

        <!-- DEFINITION TAB -->
        <mat-tab label="Definition">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">settings</mat-icon>
            Definition
          </ng-template>
          
          <div class="tab-content">
            <pre class="json-view">{{ (data?.definition | json) || 'No definition available' }}</pre>
          </div>
        </mat-tab>

        <!-- RUN TAB -->
        <mat-tab label="Run">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">play_circle</mat-icon>
            Run
          </ng-template>
          
          <div class="tab-content">
            <p class="test-description">Send a JSON payload to the workflow and inspect the response below.</p>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Test payload</mat-label>
              <textarea matInput rows="8" [(ngModel)]="testInputText"></textarea>
            </mat-form-field>

            <div class="test-actions">
              <button mat-raised-button color="accent" (click)="testWorkflow()" [disabled]="data?.enabled || loading">
                <mat-icon>play_arrow</mat-icon>
                {{ loading ? 'Running...' : 'Run test' }}
              </button>
            </div>

            <div *ngIf="testResult" class="test-result">
              <h3>Test response</h3>
              <pre class="json-view">{{ testResult | json }}</pre>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div *ngIf="executionDetails">

  <h3>Execution Details</h3>

  <pre class="json-view">{{ executionDetails | json }}</pre>

  <h3>Steps</h3>

  <div *ngFor="let step of executionDetails?.steps">

    <div class="step-box">
      <strong>{{ step.name }}</strong> - {{ step.status }}

      <div><b>Input:</b></div>
      <pre>{{ step.input | json }}</pre>

      <div><b>Output:</b></div>
      <pre>{{ step.output | json }}</pre>

    </div>

  </div>

</div>
      <div class="dialog-actions">
        <button mat-button (click)="toggleEdit()" [disabled]="loading">
          {{ editMode ? 'Cancel' : 'Edit' }}
        </button>

        <button mat-raised-button color="primary" 
                *ngIf="editMode" 
                (click)="save()"
                [disabled]="loading">
          <mat-progress-spinner *ngIf="loading" diameter="20" mode="indeterminate" class="spinner"></mat-progress-spinner>
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>

        <button mat-raised-button color="accent" 
                (click)="testWorkflow()"
                [disabled]="data?.enabled || loading"
                [matTooltip]="data?.enabled ? 'Disable workflow before testing' : ''">
          <mat-icon>play_arrow</mat-icon>
          Test Workflow
        </button>

        <button mat-button (click)="closeDialog()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      min-width: 500px;
    }

    .dialog-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    mat-tab-group {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 20px;
      overflow-y: auto;
      max-height: calc(90vh - 200px);
    }

    .tab-icon {
      margin-right: 8px;
    }

    .view-mode {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;

        .info-item {
          &.full-width {
            grid-column: 1 / -1;
          }

          label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          span, code {
            display: block;
            color: #666;
            font-size: 13px;
            word-break: break-all;
            font-family: 'Courier New', monospace;
          }

          .enabled-text {
            color: #2e7d32;
            font-weight: 600;
          }

          .disabled-text {
            color: #c62828;
            font-weight: 600;
          }

          .failure-count {
            color: #d32f2f;
            font-weight: 700;
          }
        }
      }
    }

    .edit-mode {
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
    }

    .json-view {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
      overflow-x: auto;

      pre {
        margin: 0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #333;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }

    .json-edit {
      width: 100%;

      .json-editor {
        width: 100%;
        height: 400px;
        font-family: 'Courier New', monospace;
        background: #f5f5f5;
        color: #333;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        resize: vertical;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;
      flex-wrap: wrap;

      button {
        min-width: 100px;
      }

      .spinner {
        display: flex;
        align-items: center;
        margin-right: 8px;
      }
    }

    ::ng-deep {
      .mat-mdc-tab-list {
        border-bottom: 1px solid #e0e0e0;
      }
    }
  `]
})
export class WorkflowDetailsDialogComponent implements OnInit {

  editMode = false;
  loading = false;
  jsonText = '';
  editData: any = {};
  executionDetails: any = null;
  testResult: any = null;
  testInputText = `{
  "input": {}
}`;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sdk: SailPointSDKService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<WorkflowDetailsDialogComponent>
  ) {
    this.editData = { ...data };
    this.jsonText = JSON.stringify(data, null, 2);
  }

  ngOnInit(): void {
    this.editData = JSON.parse(JSON.stringify(this.data));
    this.jsonText = JSON.stringify(this.data, null, 2);
  }

  toggleEdit(): void {
    if (this.editMode) {
      // Reset to original data
      this.editData = JSON.parse(JSON.stringify(this.data));
      this.jsonText = JSON.stringify(this.data, null, 2);
    }
    this.editMode = !this.editMode;
  }

  async save(): Promise<void> {
    if (!this.data?.id) {
      this.showMessage('Cannot save: workflow ID is missing', 'error');
      return;
    }

    this.loading = true;

    try {
      let updateData = this.editData;

      // If editing JSON directly, parse it
      if (this.jsonText !== JSON.stringify(this.editData, null, 2)) {
        updateData = JSON.parse(this.jsonText);
      }

      const patchOps: any[] = [];
      if (updateData.name !== this.data.name) {
        patchOps.push({ op: 'replace', path: '/name', value: updateData.name ?? null });
      }
      if (updateData.description !== this.data.description) {
        patchOps.push({ op: 'replace', path: '/description', value: updateData.description ?? null });
      }

      if (patchOps.length === 0) {
        this.showMessage('No changes detected to save', 'info');
        return;
      }

      await this.sdk.patchWorkflow({
        id: this.data.id,
        jsonPatchOperationV2025: patchOps
      });

      this.showMessage('Workflow updated successfully', 'success');
      this.editMode = false;
      this.dialogRef.close({ action: 'saved' });

    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Save failed';
      this.showMessage(errorMessage, 'error');
      console.error('Save error:', e);
    } finally {
      this.loading = false;
    }
  }

  async testWorkflow(): Promise<void> {
    if (this.data?.enabled) {
      this.showMessage('Disable workflow before testing', 'warning');
      return;
    }

    this.loading = true;
    this.testResult = null;

    try {
      let payload: any = {};
      if (this.testInputText.trim()) {
        payload = JSON.parse(this.testInputText);
      }

      const result = await this.sdk.testWorkflow({
        id: this.data.id,
        testWorkflowRequestV2025: {
          input: payload
        }
      });

      this.testResult = result?.data || result;
      const executionId = result?.data?.workflowExecutionId;
      if (executionId) {
        await this.loadExecutionDetails(executionId);
      }

      this.showMessage('Test triggered successfully', 'success');

    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Test failed';
      this.showMessage(errorMessage, 'error');
      console.error('Test error:', e);
    } finally {
      this.loading = false;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
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
  
  async loadExecutionDetails(executionId: string): Promise<void> {
    try {
      const res = await (this.sdk as any).getWorkflowExecution({
        id: executionId
      });

      this.executionDetails = res?.data || res;

    } catch (e) {
      console.error('Execution details failed', e);
    }
  }

  getStepCount(workflow: any): number {
    const definition = workflow?.definition;
    if (!definition) {
      return 0;
    }

    if (Array.isArray(definition.steps)) {
      return definition.steps.length;
    }
    if (Array.isArray(definition.nodes)) {
      return definition.nodes.length;
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
      if (bytes < 1024) {
        return `${bytes} B`;
      }
      return `${(bytes / 1024).toFixed(1)} KB`;
    } catch {
      return '—';
    }
  }

}