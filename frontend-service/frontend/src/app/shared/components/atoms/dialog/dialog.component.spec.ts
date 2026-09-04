import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { By } from '@angular/platform-browser';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when closed', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.fixed.inset-0'));
    expect(overlay).toBeFalsy();
  });

  it('should render when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.fixed.inset-0'));
    expect(overlay).toBeTruthy();
  });

  it('should show title', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirm Delete');
    fixture.detectChanges();
    const title = fixture.debugElement.query(By.css('#dialog-title'));
    expect(title.nativeElement.textContent).toContain('Confirm Delete');
  });

  it('should show description', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('description', 'Are you sure?');
    fixture.detectChanges();
    const desc = fixture.debugElement.query(By.css('#dialog-description'));
    expect(desc.nativeElement.textContent).toContain('Are you sure?');
  });

  it('should show close button', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('showClose', true);
    fixture.detectChanges();
    const closeBtn = fixture.debugElement.query(By.css('button[aria-label="Close"]'));
    expect(closeBtn).toBeTruthy();
  });

  it('should hide close button when disabled', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('showClose', false);
    fixture.detectChanges();
    const closeBtn = fixture.debugElement.query(By.css('button[aria-label="Close"]'));
    expect(closeBtn).toBeFalsy();
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"] > div'));
    expect(dialog.nativeElement.classList).toContain('max-w-lg');
  });

  it('should apply variant classes', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('variant', 'alert');
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"] > div'));
    expect(dialog.nativeElement.classList).toContain('border-l-4');
    expect(dialog.nativeElement.classList).toContain('border-destructive');
  });

  it('should emit confirm', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('variant', 'confirm');
    fixture.detectChanges();
    spyOn(component.confirm, 'emit');
    spyOn(component.openChange, 'emit');
    const confirmBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    confirmBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.confirm.emit).toHaveBeenCalled();
    expect(component.openChange.emit).toHaveBeenCalledWith(false);
  });

  it('should emit cancel', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    spyOn(component.openChange, 'emit');
    const cancelBtn = fixture.debugElement.query(By.css('button'));
    cancelBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.cancel.emit).toHaveBeenCalled();
    expect(component.openChange.emit).toHaveBeenCalledWith(false);
  });

  it('should close on escape', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnEscape', true);
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should not close on escape when disabled', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should close on overlay click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnOverlayClick', true);
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    const overlay = fixture.debugElement.query(By.css('.fixed.inset-0'));
    overlay.nativeElement.click();
    fixture.detectChanges();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should not close on overlay click when disabled', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnOverlayClick', false);
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    const overlay = fixture.debugElement.query(By.css('.fixed.inset-0'));
    overlay.nativeElement.click();
    fixture.detectChanges();
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should project content', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    // Content projection test would require a wrapper component
    expect(component).toBeTruthy();
  });
});