import { Component, OnDestroy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { interval, tap } from 'rxjs';
import { HostObservable } from './host-observable.decorator';

export function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

@Component({
	selector: 'test',
	template: '',
})
export class TestComponent implements OnDestroy {
	@HostObservable()
	inter = interval(1000);
	fn?: Function;

	registerSpy(fn: Function) {
		this.fn = fn;
	}

	ngOnDestroy(): void {
		if (this.fn) this.fn();
	}
}

describe('HostObservable', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<typeof component>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TestComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should unsuscribe on component destroy', async () => {
		const spy = jasmine.createSpy();
		component.inter = interval(1000).pipe(tap(spy));
		await delay(1001);
		fixture.destroy();

		return expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should not intervene component ngOnDestroy', async () => {
		const spy = jasmine.createSpy();
		component.registerSpy(spy);

		await delay(1001);
		fixture.destroy();
		return expect(spy).toHaveBeenCalledTimes(1);
	});
});
