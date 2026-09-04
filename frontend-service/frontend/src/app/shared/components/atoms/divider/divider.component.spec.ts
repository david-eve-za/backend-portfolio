import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividerComponent } from './divider.component';
import { By } from '@angular/platform-browser';

describe('DividerComponent', () => {
  let component: DividerComponent;
  let fixture: ComponentFixture<DividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render horizontal divider by default', () => {
    const line = fixture.debugElement.query(By.css('.border-t'));
    expect(line).toBeTruthy();
  });

  it('should render vertical divider', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    const line = fixture.debugElement.query(By.css('.border-l'));
    expect(line).toBeTruthy();
  });

  it('should show label at center by default', () => {
    fixture.componentRef.setInput('label', 'OR');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('span'));
    expect(label.nativeElement.textContent).toContain('OR');
  });

  it('should show label at start', () => {
    fixture.componentRef.setInput('label', 'Start');
    fixture.componentRef.setInput('labelPosition', 'start');
    fixture.detectChanges();
    const spans = fixture.debugElement.queryAll(By.css('span'));
    expect(spans[0].nativeElement.textContent).toContain('Start');
  });

  it('should show label at end', () => {
    fixture.componentRef.setInput('label', 'End');
    fixture.componentRef.setInput('labelPosition', 'end');
    fixture.detectChanges();
    const spans = fixture.debugElement.queryAll(By.css('span'));
    expect(spans[spans.length - 1].nativeElement.textContent).toContain('End');
  });

  it('should have correct role', () => {
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.getAttribute('role')).toBe('separator');
  });

  it('should have correct aria-orientation', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('should apply custom class', () => {
    fixture.componentRef.setInput('class', 'custom-divider');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.classList).toContain('custom-divider');
  });
});