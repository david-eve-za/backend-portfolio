import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';
import { By } from '@angular/platform-browser';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default variant', () => {
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.nativeElement.classList).toContain('bg-muted');
  });

  it('should apply variant classes', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.nativeElement.classList).toContain('bg-success-bg');
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.nativeElement.classList).toContain('px-3');
  });

  it('should show dot when dot is true', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    const dot = fixture.debugElement.query(By.css('span > span'));
    expect(dot).toBeTruthy();
  });

  it('should apply custom dot color', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.componentRef.setInput('dotColor', '#ff0000');
    fixture.detectChanges();
    const dot = fixture.debugElement.query(By.css('span > span'));
    expect(dot.nativeElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should show remove button when removable', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const removeBtn = fixture.debugElement.query(By.css('button'));
    expect(removeBtn).toBeTruthy();
  });

  it('should emit removed when remove button clicked', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    spyOn(component.removed, 'emit');
    const removeBtn = fixture.debugElement.query(By.css('button'));
    removeBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.removed.emit).toHaveBeenCalled();
  });

  it('should emit removed on Enter key when removable', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    spyOn(component.removed, 'emit');
    const badge = fixture.debugElement.query(By.css('span'));
    badge.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.removed.emit).toHaveBeenCalled();
  });

  it('should emit removed on Space key when removable', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    spyOn(component.removed, 'emit');
    const badge = fixture.debugElement.query(By.css('span'));
    const event = new KeyboardEvent('keydown', { key: ' ' });
    Object.defineProperty(event, 'preventDefault', { value: () => {} });
    badge.nativeElement.dispatchEvent(event);
    fixture.detectChanges();
    expect(component.removed.emit).toHaveBeenCalled();
  });
});