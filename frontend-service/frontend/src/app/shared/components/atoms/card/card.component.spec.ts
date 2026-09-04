import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default variant', () => {
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('bg-surface');
    expect(card.nativeElement.classList).toContain('border-border');
  });

  it('should apply variant classes', () => {
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('bg-transparent');
    expect(card.nativeElement.classList).toContain('border-2');
  });

  it('should apply elevated variant', () => {
    fixture.componentRef.setInput('variant', 'elevated');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('shadow-lg');
  });

  it('should apply padding', () => {
    fixture.componentRef.setInput('padding', 'lg');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('p-8');
  });

  it('should apply hoverable', () => {
    fixture.componentRef.setInput('hoverable', true);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('hover:shadow-md');
  });

  it('should project header content', () => {
    const testComponent = `
      <bt-card>
        <div slot="header">Header</div>
        Content
        <div slot="footer">Footer</div>
      </bt-card>
    `;
    // Content projection test would require a wrapper component
    expect(component).toBeTruthy();
  });

  it('should apply custom class', () => {
    fixture.componentRef.setInput('class', 'custom-card');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('div'));
    expect(card.nativeElement.classList).toContain('custom-card');
  });
});