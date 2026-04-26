import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workflow-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog">
      <div class="risk-mark">
        <mat-icon>warning</mat-icon>
      </div>
      <div class="dialog-copy">
        <h2>{{ data.title }}</h2>
        <p>{{ data.message }}</p>
        <div class="risk-strip">
          <mat-icon>lock</mat-icon>
          <span>{{ data.detail }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-button (click)="close(false)">Cancel</button>
        <button mat-raised-button color="warn" (click)="close(true)">
          <mat-icon>delete_forever</mat-icon>
          Delete
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      width: min(460px, 84vw);
      padding: 24px;
      color: #450a0a;
      background:
        linear-gradient(180deg, rgba(254, 242, 242, 0.95), #fff 56%),
        #fff;
      border-top: 5px solid #dc2626;
    }

    .risk-mark {
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px;
      color: #fff;
      background: linear-gradient(135deg, #ef4444, #991b1b);
      box-shadow: 0 18px 30px rgba(220, 38, 38, 0.25);
      margin-bottom: 16px;
    }

    .risk-mark mat-icon {
      font-size: 34px;
      width: 34px;
      height: 34px;
    }

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 900;
    }

    p {
      margin: 8px 0 16px;
      color: #7f1d1d;
      line-height: 1.45;
    }

    .risk-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #fee2e2;
      color: #991b1b;
      font-size: 13px;
      font-weight: 700;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 22px;
    }
  `]
})
export class WorkflowDeleteDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<WorkflowDeleteDialogComponent>
  ) {}

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
