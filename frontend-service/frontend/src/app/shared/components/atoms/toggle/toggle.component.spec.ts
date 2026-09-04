import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleComponent } from './toggle.component';
import { By } from '@angular/platform-browser';

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render switch by default', () => {
    const switchEl = fixture.debugElement.query(By.css('.relative.inline-flex'));
    expect(switchEl).toBeTruthy();
  });

  it('should render checkbox when type is checkbox', () => {
    fixture.componentRef.setInput('type', 'checkbox');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.classList).toContain('h-4');
  });

  it('should emit valueChange on change', () => {
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith(true);
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const switchEl = fixture.debugElement.query(By.css('.relative.inline-flex > div'));
    expect(switchEl.nativeElement.classList).toContain('w-14');
  });

  it('should show label', () => {
    fixture.componentRef.setInput('label', 'Enable feature');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('span'));
    expect(label.nativeElement.textContent).toContain('Enable feature');
  });

  it('should show hint', () => {
    fixture.componentRef.setInput('hint', 'Toggle to enable');
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('p'));
    expect(hint.nativeElement.textContent).toContain('Toggle to enable');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBe(true);
    const switchEl = fixture.debugElement.query(By.css('.relative.inline-flex > div'));
    expect(switchEl.nativeElement.classList).toContain('opacity-50');
  });
});