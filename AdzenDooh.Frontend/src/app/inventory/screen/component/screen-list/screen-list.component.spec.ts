import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ScreenComponent } from './screen-list.component';
import { ScreenService } from '../../service/screen.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

describe('ScreenComponent', () => {
  let component: ScreenComponent;
  let fixture: ComponentFixture<ScreenComponent>;
  let screenServiceSpy: jasmine.SpyObj<ScreenService>;

  beforeEach(async () => {

    screenServiceSpy = jasmine.createSpyObj('ScreenService', [
      'getGrid',
      'deleteScreen'
    ]);

    screenServiceSpy.getGrid.and.returnValue(of({
      success: true,
      data: {
        data: [
          { id: 1, name: 'Screen 1' },
          { id: 2, name: 'Screen 2' }
        ],
        totalCount: 2
      }
    } as any));

    screenServiceSpy.deleteScreen.and.returnValue(of({ success: true } as any));

    await TestBed.configureTestingModule({
      imports: [
        ScreenComponent,
        HttpClientTestingModule   // ✅ FIX: resolves ApiService → HttpClient
      ],
      providers: [
        { provide: ScreenService, useValue: screenServiceSpy },

        // ✅ FIX: AppComponent dependency chain
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load screens on init', () => {
    expect(screenServiceSpy.getGrid).toHaveBeenCalled();
    expect(component.screenConfig.dataSource.data.length).toBe(2);
  });

  it('should apply filter and reset page', () => {
    component.onFilter('test');

    expect(component.param.offset).toBe(0);
    expect((component.param.filter as any).search).toBe('test');
    expect(screenServiceSpy.getGrid).toHaveBeenCalled();
  });

  it('should apply sort and reload', () => {
    component.onSort({ field: 'name', order: 1 });

    expect(component.param.sortBy).toBe('name');
    expect(component.param.sortOrder).toBe('asc');
    expect(screenServiceSpy.getGrid).toHaveBeenCalled();
  });

  it('should prepare new screen for add', () => {
    component.screenCreateEdit = {
      open: jasmine.createSpy('open')
    } as any;

    component.openAddScreen();

    expect(component.currentScreen.id).toBe(0);
    expect(component.screenCreateEdit.open).toHaveBeenCalled();
  });

  it('should set current screen and open edit dialog', () => {
    component.screenCreateEdit = {
      open: jasmine.createSpy('open')
    } as any;

    const screen = { id: 5, name: 'Test' } as any;

    component.editScreen(screen);

    expect(component.currentScreen.id).toBe(5);
    expect(component.screenCreateEdit.open).toHaveBeenCalled();
  });

  it('should call confirm dialog on delete', () => {
    (component as any).confirmDialog = jasmine.createSpy('confirmDialog');

    component.deleteScreen({ id: 1, name: 'Test Screen' } as any);

    expect((component as any).confirmDialog).toHaveBeenCalled();
  });

  it('should update screen list after form close', () => {
    const newScreen = { id: 3, name: 'New Screen' } as any;

    component.afterFormClosed(newScreen);

    const exists = component.screenConfig.dataSource.data.find(s => s.id === 3);
    expect(exists).toBeTruthy();
  });
});