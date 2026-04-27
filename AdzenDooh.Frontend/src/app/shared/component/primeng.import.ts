import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // ← was ConfirmDialog
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';

export { MessageService, ConfirmationService } from 'primeng/api';

export const sharedImports = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  DialogModule,
  ButtonModule,
  InputTextModule,
  InputNumberModule,
  DropdownModule,
  ConfirmDialogModule, 
  ToastModule,
  InputTextareaModule,
  SelectButtonModule,
];