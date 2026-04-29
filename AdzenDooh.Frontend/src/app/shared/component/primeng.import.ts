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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload'; 
import { SidebarModule }         from 'primeng/sidebar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule }         from 'primeng/message';

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
  IconFieldModule,
  InputIconModule,
  TooltipModule,
   FileUploadModule,
   SidebarModule,
   ProgressSpinnerModule,
   MessageModule
];