import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
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
  ConfirmDialog,
  ToastModule,
  TextareaModule,
  SelectButtonModule,
];
