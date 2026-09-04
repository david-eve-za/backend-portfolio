import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { By } from '@angular/platform-browser';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table headers', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ]);
    fixture.detectChanges();
    const headers = fixture.debugElement.queryAll(By.css('th'));
    expect(headers.length).toBe(2);
    expect(headers[0].nativeElement.textContent).toContain('Name');
    expect(headers[1].nativeElement.textContent).toContain('Email');
  });

  it('should render data rows', () => {
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Name' }]);
    fixture.componentRef.setInput('data', [{ name: 'John' }, { name: 'Jane' }]);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should show empty message when no data', () => {
    fixture.componentRef.setInput('emptyMessage', 'No users');
    fixture.detectChanges();
    const td = fixture.debugElement.query(By.css('td'));
    expect(td.nativeElement.textContent).toContain('No users');
  });

  it('should show loading spinner', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('bt-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should select row', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('data', [{ id: 1, name: 'John' }]);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    checkbox.nativeElement.click();
    fixture.detectChanges();
    expect(component.isSelected({ id: 1, name: 'John' })).toBe(true);
  });

  it('should select all rows', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('data', [{ id: 1 }, { id: 2 }]);
    fixture.detectChanges();
    const headerCheckbox = fixture.debugElement.query(By.css('thead input[type="checkbox"]'));
    headerCheckbox.nativeElement.click();
    fixture.detectChanges();
    expect(component.allSelected()).toBe(true);
  });

  it('should sort column', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name', sortable: true },
    ]);
    fixture.componentRef.setInput('data', [{ name: 'B' }, { name: 'A' }]);
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.css('th'));
    header.nativeElement.click();
    fixture.detectChanges();
    expect(component.sortColumn()).toBe('name');
    expect(component.sortDirection()).toBe('asc');
  });

  it('should paginate data', () => {
    fixture.componentRef.setInput('data', Array.from({ length: 25 }, (_, i) => ({ id: i })));
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('showPagination', true);
    fixture.detectChanges();
    expect(component.totalPages()).toBe(3);
    expect(component.paginatedData().length).toBe(10);
  });

  it('should navigate pages', () => {
    fixture.componentRef.setInput('data', Array.from({ length: 25 }, (_, i) => ({ id: i })));
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();
    component.nextPage();
    expect(component.currentPage()).toBe(2);
    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });

  it('should render actions', () => {
    fixture.componentRef.setInput('actions', [
      { label: 'Edit', action: () => {} },
    ]);
    fixture.componentRef.setInput('data', [{ id: 1 }]);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('should emit rowClick', () => {
    spyOn(component.rowClick, 'emit');
    fixture.componentRef.setInput('data', [{ id: 1, name: 'John' }]);
    fixture.detectChanges();
    const row = fixture.debugElement.query(By.css('tbody tr'));
    row.nativeElement.click();
    fixture.detectChanges();
    expect(component.rowClick.emit).toHaveBeenCalledWith({ id: 1, name: 'John' });
  });
});