import { Component, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _messageService: MessageService;
  private _confirmationService: ConfirmationService;

  constructor(injector: Injector) {
    this._messageService = injector.get(MessageService);
    this._confirmationService = injector.get(ConfirmationService);
  }

  protected showMessage(severity: string, summary: string, detail: string): void {
    this._messageService.add({ severity, summary, detail });
  }

  protected confirmDialog(
    message: string,
    header: string,
    icon: string,
    acceptCallback: () => void
  ): void {
    this._confirmationService.confirm({
      message,
      header,
      icon,
      accept: acceptCallback
    });
  }
}