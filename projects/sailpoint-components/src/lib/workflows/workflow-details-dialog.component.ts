import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  styles: [
    `
    .flow-board {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }
    .flow-node {
      min-width: 140px;
      padding: 0.8rem 1rem;
      border: 1px solid #d0d0d0;
      border-radius: 10px;
      background: #fafafa;
      color: #1f1f1f;
      text-align: left;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    .flow-node:hover {
      background: #f1f6ff;
      transform: translateY(-1px);
    }
    .flow-node.selected {
      background: #e7f0ff;
      border-color: #4d7cff;
    }
    .flow-key {
      display: block;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }
    .flow-type {
      display: block;
      font-size: 0.87rem;
      color: #555;
    }
    .flow-details {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid #dde2ea;
      border-radius: 10px;
      background: #ffffff;
    }
    .flow-hint {
      margin-left: auto;
      font-size: 0.92rem;
      color: #666;
    }
    .empty-panel {
      padding: 0.9rem 1rem;
      border-radius: 8px;
      border: 1px dashed #c6c6c6;
      background: #fbfbfb;
      color: #5e5e5e;
    }
    .execution-flow-popup, .step-details-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 90vw;
      max-height: 80vh;
      overflow: auto;
      padding: 20px;
    }
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      justify-content: center;
    }
    `,
    `
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

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

    .json-tree {
      background: #0f172a;
      color: #dbeafe;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 16px;
      overflow: auto;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.55;
      max-height: 56vh;
    }

    .json-node {
      margin: 2px 0;

      summary {
        cursor: pointer;
        list-style: none;
        display: flex;
        align-items: center;
        gap: 6px;
        border-radius: 8px;
        padding: 2px 4px;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      summary::before {
        content: 'chevron_right';
        font-family: 'Material Icons';
        color: #38bdf8;
        font-size: 16px;
      }

      &[open] > summary::before {
        content: 'expand_more';
      }

      summary:hover {
        background: rgba(14, 165, 233, 0.16);
      }
    }

    .json-children {
      margin-left: 22px;
      padding-left: 12px;
      border-left: 1px solid rgba(148, 163, 184, 0.35);
    }

    .json-key {
      color: #67e8f9;
      font-weight: 700;
    }

    .json-brace,
    .json-muted {
      color: #94a3b8;
    }

    .json-string {
      color: #bbf7d0;
    }

    .json-number,
    .json-boolean {
      color: #fcd34d;
    }

    .json-null {
      color: #fda4af;
    }

    .json-leaf {
      display: flex;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 8px;
    }

    .json-leaf:hover {
      background: rgba(14, 165, 233, 0.12);
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

    .executions-tab {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .execution-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      mat-form-field {
        flex: 1 1 260px;
      }
    }

    .execution-list {
      display: grid;
      gap: 8px;
    }

    .execution-row {
      width: 100%;
      border: 1px solid #dbeafe;
      background: linear-gradient(135deg, #eff6ff, #f0fdfa);
      color: #0f172a;
      border-radius: 12px;
      padding: 10px 12px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 10px;
      align-items: center;
      text-align: left;
      cursor: pointer;
      font: inherit;
    }

    .execution-row:hover {
      border-color: #0ea5e9;
      background: linear-gradient(135deg, #dbeafe, #ccfbf1);
      color: #0f172a;
    }

    .execution-row.active {
      border-color: #2563eb;
      background: #dbeafe;
      color: #0f172a;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.16);
    }

    .execution-status {
      background: #dbeafe;
      color: #1e40af;
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .execution-detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .empty-panel {
      background: #f8fafc;
      color: #64748b;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
      font-weight: 700;
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
    `
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data?.name || 'Workflow Details' }}</h2>
        <button mat-stroked-button (click)="loadWorkflow()" [disabled]="loading || !data?.id">
          <mat-icon>sync</mat-icon>
          Refresh detail
        </button>
      </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event)">
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
                  <span>{{ getExecutionCount(data) }}</span>
                </div>

                <div class="info-item">
                  <label>Failures:</label>
                  <span class="failure-count">{{ getFailureCount(data) }}</span>
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
            <div *ngIf="!editMode" class="json-tree">
              <ng-container *ngTemplateOutlet="jsonNode; context: { value: data, keyName: '', depth: 0 }"></ng-container>
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
            <div *ngIf="!editMode">
              <div class="json-tree" *ngIf="data?.definition; else noDefinition">
                <ng-container *ngTemplateOutlet="jsonNode; context: { value: data.definition, keyName: 'definition', depth: 0 }"></ng-container>
              </div>
            </div>
            <div *ngIf="editMode" class="json-edit">
              <textarea [(ngModel)]="definitionText" class="json-editor"></textarea>
            </div>
            <ng-template #noDefinition>
              <div class="empty-panel">No definition available</div>
            </ng-template>
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

        <!-- EXECUTIONS TAB -->
        <mat-tab label="Executions">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">history</mat-icon>
            Executions
          </ng-template>

          <div class="tab-content executions-tab">
            <div class="execution-toolbar">
              <button mat-raised-button color="primary" (click)="loadExecutions()" [disabled]="loading">
                <mat-icon>sync</mat-icon>
                Load executions
              </button>
              <mat-form-field appearance="outline">
                <mat-label>Status filter</mat-label>
                <mat-select [(ngModel)]="executionStatusFilter" (selectionChange)="loadExecutions()">
                  <mat-option value="">All statuses</mat-option>
                  <mat-option *ngFor="let status of executionStatuses" [value]="status">{{ status }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Start date</mat-label>
                <input matInput [matDatepicker]="startPicker" [(ngModel)]="executionStartDate" (dateChange)="loadExecutions()">
                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End date</mat-label>
                <input matInput [matDatepicker]="endPicker" [(ngModel)]="executionEndDate" (dateChange)="loadExecutions()">
                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
              <button mat-button (click)="clearDateFilters()" *ngIf="executionStartDate || executionEndDate">
                <mat-icon>clear</mat-icon>
                Clear dates
              </button>
            </div>

            <div class="execution-list" *ngIf="executions.length > 0">
              <button class="execution-row"
                      *ngFor="let execution of executions"
                      (click)="loadExecutionDetails(getExecutionId(execution))"
                      [class.active]="selectedExecutionId === getExecutionId(execution)">
                <span class="execution-status">{{ execution.status || 'Unknown' }}</span>
                <span>{{ execution.startTime || execution.created || getExecutionId(execution) }}</span>
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <div class="pagination-controls" *ngIf="executions.length > 0">
              <mat-form-field appearance="outline" style="width: 100px;">
                <mat-label>Page size</mat-label>
                <mat-select [(ngModel)]="pageSize" (selectionChange)="changePageSize()">
                  <mat-option *ngFor="let size of pageSizes" [value]="size">{{ size }}</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-icon-button (click)="prevPage()" [disabled]="currentPage === 0" matTooltip="Previous page">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span>{{ currentPage + 1 }} of {{ Math.ceil(totalExecutions / pageSize) || 1 }}</span>
              <button mat-icon-button (click)="nextPage()" [disabled]="(currentPage + 1) * pageSize >= totalExecutions" matTooltip="Next page">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button mat-icon-button (click)="goToFirstPage()" [disabled]="currentPage === 0" matTooltip="First page">
                <mat-icon>first_page</mat-icon>
              </button>
              <button mat-icon-button (click)="goToLastPage()" [disabled]="(currentPage + 1) * pageSize >= totalExecutions" matTooltip="Last page">
                <mat-icon>last_page</mat-icon>
              </button>
            </div>

            <div class="empty-panel" *ngIf="executions.length === 0 && !loading">
              No executions loaded
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Execution Flow Popup -->
      <div *ngIf="showExecutionFlowPopup" class="popup-overlay" (click)="closeExecutionFlowPopup()"></div>
      <div *ngIf="showExecutionFlowPopup" class="execution-flow-popup">
        <div class="dialog-header">
          <h2>Execution Flow: {{ selectedExecutionId }}</h2>
          <button mat-icon-button (click)="closeExecutionFlowPopup()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="flow-board" *ngIf="getExecutionFlowSteps().length > 0; else noFlowDefinition">
          <button type="button"
                  class="flow-node"
                  *ngFor="let step of getExecutionFlowSteps()"
                  [class.selected]="selectedExecutionStepKey === step.key"
                  (click)="selectExecutionStep(step.key, step.step)">
            <span class="flow-key">{{ step.key }}</span>
            <span class="flow-type">{{ step.step?.type || step.step?.action || step.step?.status || 'Step' }}</span>
          </button>
        </div>
        <ng-template #noFlowDefinition>
          <div class="empty-panel">No execution flow available</div>
        </ng-template>
      </div>

      <!-- Step Details Popup -->
      <div *ngIf="showStepDetailsPopup" class="popup-overlay" (click)="closeStepDetailsPopup()"></div>
      <div *ngIf="showStepDetailsPopup" class="step-details-popup">
        <div class="dialog-header">
          <h2>Step Details: {{ selectedExecutionStepKey }}</h2>
          <button mat-icon-button (click)="closeStepDetailsPopup()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="json-tree">
          <ng-container *ngTemplateOutlet="jsonNode; context: { value: selectedExecutionStepValue, keyName: selectedExecutionStepKey, depth: 0 }"></ng-container>
        </div>
      </div>

      <ng-template #jsonNode let-value="value" let-keyName="keyName" let-depth="depth">
        <details *ngIf="isExpandable(value); else primitiveNode" class="json-node" [open]="depth < 2">
          <summary>
            <span class="json-key" *ngIf="keyName">{{ keyName }}:</span>
            <span class="json-brace">{{ isArray(value) ? '[' : '{' }}</span>
            <span class="json-muted">{{ getNodeSummary(value) }}</span>
          </summary>
          <div class="json-children">
            <div *ngFor="let key of getObjectKeys(value)" class="json-line">
              <ng-container *ngTemplateOutlet="jsonNode; context: { value: value[key], keyName: key, depth: depth + 1 }"></ng-container>
            </div>
          </div>
          <span class="json-brace">{{ isArray(value) ? ']' : '}' }}</span>
        </details>
        <ng-template #primitiveNode>
          <div class="json-leaf">
            <span class="json-key" *ngIf="keyName">{{ keyName }}:</span>
            <span [ngClass]="getPrimitiveClass(value)">{{ formatPrimitive(value) }}</span>
          </div>
        </ng-template>
      </ng-template>

      <div class="dialog-actions">
        <button mat-button (click)="toggleEdit()" [disabled]="loading" *ngIf="isEditableTab(selectedTab)">
          {{ editMode ? 'Cancel' : 'Edit' }}
        </button>

        <button mat-raised-button color="primary" 
                *ngIf="editMode && isEditableTab(selectedTab)" 
                (click)="save()"
                [disabled]="loading">
          <mat-progress-spinner *ngIf="loading" diameter="20" mode="indeterminate" class="spinner"></mat-progress-spinner>
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>

        <button mat-raised-button color="accent" 
                (click)="testWorkflow()"
                [disabled]="data?.enabled || loading"
                [matTooltip]="data?.enabled ? 'Disable workflow before testing' : ''"
                *ngIf="selectedTab === 'Run'">
          <mat-icon>play_arrow</mat-icon>
          Test Workflow
        </button>

        <button mat-button (click)="closeDialog()">Close</button>
      </div>
    </div>
  `
})
export class WorkflowDetailsDialogComponent implements OnInit {

  editMode = false;
  loading = false;
  jsonText = '';
  definitionText = '';
  editData: any = {};
  executionDetails: any = null;
  executionHistory: any = null;
  executions: any[] = [];
  selectedExecutionId = '';
  executionStatusFilter = '';
  executionStatuses = ['Completed', 'Failed', 'Running', 'Canceled', 'Queued'];
  executionStartDate: Date | null = null;
  executionEndDate: Date | null = null;
  selectedExecutionStepKey: string | null = null;
  selectedExecutionStepValue: any = null;
  testResult: any = null;
  testInputText = `{
  "input": {}
}`;

  currentPage = 0;
  pageSize = 20;
  pageSizes = [5, 10, 20, 50];
  totalExecutions = 0;
  showExecutionFlowPopup = false;
  showStepDetailsPopup = false;
  selectedTab = 'Details';
  Math = Math;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sdk: SailPointSDKService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<WorkflowDetailsDialogComponent>
  ) {
  }

  onTabChange(tab: any): void {
    this.selectedTab = tab?.textLabel || 'Details';
  }

  async ngOnInit(): Promise<void> {
    await this.loadWorkflow();
    this.loadExecutions();
  }

  private syncEditData(): void {
    this.editData = JSON.parse(JSON.stringify(this.data));
    this.jsonText = JSON.stringify(this.data, null, 2);
    this.definitionText = this.data?.definition ? JSON.stringify(this.data.definition, null, 2) : '';
  }

  public isEditableTab(tab: string): boolean {
    return ['Details', 'JSON', 'Definition'].includes(tab);
  }

  toggleEdit(): void {
    if (this.editMode) {
      this.syncEditData();
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
      let updateData: any = this.editData;
      const isJsonSave = this.selectedTab === 'JSON';
      const isDefinitionSave = this.selectedTab === 'Definition';

      if (isJsonSave) {
        updateData = JSON.parse(this.jsonText);
      } else if (isDefinitionSave) {
        const definition = this.definitionText ? JSON.parse(this.definitionText) : null;
        updateData = { ...this.data, definition };
      }

      if (isJsonSave || isDefinitionSave) {
        await this.sdk.putWorkflow({
          id: this.data.id,
          workflowBodyV2025: this.cleanWorkflowBody(updateData)
        });
      } else {
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
      }

      this.showMessage('Workflow updated successfully', 'success');
      this.editMode = false;
      await this.loadWorkflow();
      this.syncEditData();
      this.dialogRef.close({ action: 'saved' });
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Save failed';
      this.showMessage(errorMessage, 'error');
      console.error('Save error:', e);
    } finally {
      this.loading = false;
    }
  }

  async loadWorkflow(): Promise<void> {
    if (!this.data?.id) {
      return;
    }

    this.loading = true;
    try {
      const res = await this.sdk.getWorkflow({ id: this.data.id });
      this.data = res?.data || res;
      this.syncEditData();
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load workflow details';
      this.showMessage(errorMessage, 'error');
      console.error('Workflow detail load failed:', e);
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
        testWorkflowRequestV2025: payload?.input ? payload : { input: payload }
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
    if (!executionId) {
      return;
    }
    this.selectedExecutionId = executionId;
    this.executionHistory = null;
    this.selectedExecutionStepKey = null;
    this.selectedExecutionStepValue = null;
    try {
      const res = await (this.sdk as any).getWorkflowExecution({
        id: executionId
      });

      this.executionDetails = res?.data || res;

      // Automatically load history for flow visualization
      await this.loadExecutionHistory(executionId);

      // Open execution flow popup
      this.showExecutionFlowPopup = true;

      // Auto-select first step if available
      if (Array.isArray(this.executionHistory) && this.executionHistory.length > 0) {
        const firstStep = this.executionHistory[0];
        const stepType = firstStep.type || firstStep.action || 'Unknown';
        const stepName = firstStep.attributes?.stepName || firstStep.name || 'Step';
        const key = `0 : ${stepType}-${stepName}`;
        this.selectExecutionStep(key, firstStep);
      }

    } catch (e) {
      console.error('Execution details failed', e);
    }
  }

  async loadExecutions(): Promise<void> {
    if (!this.data?.id) {
      this.showMessage('Cannot load executions: workflow ID is missing', 'error');
      return;
    }

    this.executions = [];
    this.selectedExecutionId = '';
    this.executionDetails = null;
    this.executionHistory = null;
    this.selectedExecutionStepKey = null;
    this.selectedExecutionStepValue = null;

    this.loading = true;
    
    try {
      const res = await this.sdk.getWorkflowExecutions({
        id: this.data.id,
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
        filters: this.getExecutionStatusFilter()
      });
      const payload = res?.data || res;
      this.executions = this.extractExecutions(payload);
      this.totalExecutions = (payload as any)?.totalCount || (payload as any)?.count || this.executions.length;
      if (this.executions.length === 0) {
        this.showMessage('No executions found', 'info');
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load executions';
      this.showMessage(errorMessage, 'error');
      console.error('Executions load failed:', e);
    } finally {
      this.loading = false;
    }
  }

  private extractExecutions(payload: any): any[] {
    if (!payload) {
      return [];
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload.items)) {
      return payload.items;
    }
    if (Array.isArray(payload.executions)) {
      return payload.executions;
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  }

  private getExecutionStatusFilter(): string | undefined {
    const filters: string[] = [];
    
    if (this.executionStatusFilter) {
      filters.push(`status eq "${this.executionStatusFilter}"`);
    }
    
    if (this.executionStartDate) {
      const startDate = this.executionStartDate.toISOString().split('T')[0];
      filters.push(`startTime ge "${startDate}T00:00:00.000Z"`);
    }
    
    if (this.executionEndDate) {
      const endDate = this.executionEndDate.toISOString().split('T')[0];
      filters.push(`startTime le "${endDate}T23:59:59.999Z"`);
    }
    
    return filters.length > 0 ? filters.join(' and ') : undefined;
  }

  clearDateFilters(): void {
    this.executionStartDate = null;
    this.executionEndDate = null;
    this.loadExecutions();
  }

  goToFirstPage(): void {
    if (this.currentPage > 0) {
      this.currentPage = 0;
      this.loadExecutions();
    }
  }

  changePageSize(): void {
    this.currentPage = 0;
    this.loadExecutions();
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalExecutions) {
      this.currentPage++;
      this.loadExecutions();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadExecutions();
    }
  }

  goToLastPage(): void {
    const totalPages = Math.ceil(this.totalExecutions / this.pageSize);
    if (this.currentPage < totalPages - 1) {
      this.currentPage = totalPages - 1;
      this.loadExecutions();
    }
  }

  async loadExecutionHistory(executionId: string): Promise<void> {
    if (!executionId) {
      return;
    }

    this.loading = true;
    try {
      const res = await this.sdk.getWorkflowExecutionHistory({ id: executionId });
      this.executionHistory = res?.data || res;
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load execution history';
      this.showMessage(errorMessage, 'error');
      console.error('Execution history failed:', e);
    } finally {
      this.loading = false;
    }
  }

  isExpandable(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getObjectKeys(value: any): string[] {
    if (!this.isExpandable(value)) {
      return [];
    }
    return Object.keys(value);
  }

  getNodeSummary(value: any): string {
    const count = this.getObjectKeys(value).length;
    return Array.isArray(value) ? `${count} item${count === 1 ? '' : 's'}` : `${count} field${count === 1 ? '' : 's'}`;
  }

  formatPrimitive(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  }

  getPrimitiveClass(value: any): string {
    if (value === null || value === undefined) {
      return 'json-null';
    }
    return `json-${typeof value}`;
  }

  getExecutionId(execution: any): string {
    return execution?.id || execution?.workflowExecutionId || '';
  }

  getExecutionCount(workflow: any): number {
    const value = workflow?.executionCount
      ?? workflow?.executionsCount
      ?? workflow?.executionStats?.total
      ?? workflow?.executionStats?.count
      ?? workflow?.stats?.executionCount
      ?? workflow?.stats?.executions;

    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  getFailureCount(workflow: any): number {
    const value = workflow?.failureCount
      ?? workflow?.failedExecutionCount
      ?? workflow?.executionStats?.failed
      ?? workflow?.executionStats?.failureCount
      ?? workflow?.stats?.failureCount;

    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  getExecutionFlowSteps(): Array<{ key: string; step: any }> {
    if (!Array.isArray(this.executionHistory)) {
      return [];
    }

    return this.executionHistory.map((step: any, index: number) => {
      const stepType = step.type || step.action || 'Unknown';
      const stepName = step.attributes?.stepName || step.name || 'Step';
      const key = `${index} : ${stepType}-${stepName}`;
      return { key, step };
    });
  }

  selectExecutionStep(stepKey: string, stepValue: any): void {
    this.selectedExecutionStepKey = stepKey;
    this.selectedExecutionStepValue = this.findExecutionStepJson(stepKey) || stepValue;
    this.showStepDetailsPopup = true;
  }

  closeExecutionFlowPopup(): void {
    this.showExecutionFlowPopup = false;
    this.selectedExecutionStepKey = null;
    this.selectedExecutionStepValue = null;
  }

  closeStepDetailsPopup(): void {
    this.showStepDetailsPopup = false;
  }

  private findExecutionStepJson(stepKey: string): any {
    if (!Array.isArray(this.executionHistory)) {
      return null;
    }

    return this.executionHistory.find((item: any) =>
      (item?.stepId || item?.name || `${this.executionHistory.indexOf(item)}`) === stepKey
    ) || null;
  }

  getStepCount(workflow: any): number {
    const definition = workflow?.definition;
    if (!definition) {
      return 0;
    }

    if (Array.isArray(definition.steps)) {
      return definition.steps.length;
    }
    if (definition.steps && typeof definition.steps === 'object') {
      return Object.keys(definition.steps).length;
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

  private cleanWorkflowBody(workflow: any): any {
    const { id, created, modified, modifiedBy, creator, executionCount, failureCount, ...body } = workflow;
    return body;
  }

}
