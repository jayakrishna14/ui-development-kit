import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-workflow-json-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="workflow-json-dialog">
      <div class="dialog-title">
        <mat-icon>{{ data.icon || 'add_circle' }}</mat-icon>
        <div>
          <h2>{{ data.title }}</h2>
          <p>{{ data.subtitle }}</p>
        </div>
      </div>

      <mat-form-field appearance="outline" class="json-field">
        <mat-label>Workflow JSON</mat-label>
        <textarea matInput [(ngModel)]="jsonText" rows="20" spellcheck="false"></textarea>
      </mat-form-field>

      <div *ngIf="errorMessage" class="json-error">
        <mat-icon>error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="close()">Cancel</button>
        <button mat-raised-button color="primary" (click)="submit()">
          <mat-icon>{{ data.actionIcon || 'check' }}</mat-icon>
          {{ data.actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .workflow-json-dialog {
      width: min(860px, 82vw);
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      background: #fff;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #172554;
    }

    .dialog-title mat-icon {
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: linear-gradient(135deg, #2563eb, #14b8a6);
      border-radius: 14px;
    }

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
    }

    p {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .json-field {
      width: 100%;
    }

    textarea {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .json-error {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #b91c1c;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 600;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class WorkflowJsonDialogComponent {
  jsonText = '';
  errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<WorkflowJsonDialogComponent>
  ) {
    this.jsonText = data.jsonText || '';
  }

  submit(): void {
    try {
      const workflow = JSON.parse(this.jsonText);
      this.dialogRef.close(workflow);
    } catch (error: any) {
      this.errorMessage = error?.message || 'Invalid JSON';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
