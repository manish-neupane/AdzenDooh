import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { sharedImports } from '../../../../shared/component/primeng.import';
import { CreativeService } from '../../service/creative.service';
import { FileUploadModule } from 'primeng/fileupload';
import { AuthService } from '../../../../shared/service/auth.service';
@Component({
  selector: 'creative-upload',
  standalone: true,
  imports: [...sharedImports,FileUploadModule],
  templateUrl: './creative-upload.component.html'
})
export class CreativeUploadComponent extends AppComponent implements OnInit, OnDestroy {
  @Output() afterUploadClosed = new EventEmitter<boolean>();

  formGroup!: FormGroup;
  isOpen = false;
  isLoading = false;
  selectedFile: File | null = null;


   
  private _unSubscribeAll$ = new Subject<void>();

  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private authService: AuthService,
    private creativeService: CreativeService
  ) {
    super(injector);
    this.formGroup = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: ['', Validators.required]
    });
  }
  open(): void {
    this.formGroup.reset();
    this.selectedFile = null;
    this.isOpen = true;
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.files[0];
  }

  onSubmit(): void {
    if (this.formGroup.invalid || !this.selectedFile) {
      this.showMessage('warn', 'Validation', 'Please provide a name and a file');
      return;
    }

    this.isLoading = true;
    const payload = {
      ...this.formGroup.value,
      tenantId: this.authService.currentUser.tenantId,
      createdBy: this.authService.currentUser.userId
    };

    this.creativeService.upload( this.selectedFile!,payload)
      .pipe( takeUntil(this._unSubscribeAll$),finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.showMessage('success', 'Success', 'Media uploaded successfully');
          this.afterUploadClosed.emit(true);
          this.isOpen = false;
        },
        error: (err) => this.showMessage('error', 'Error', err?.error?.message ?? 'Upload failed')
      });
  }

  ngOnDestroy(): void{
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}