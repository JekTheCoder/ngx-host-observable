import { OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

type AngularObject = Partial<OnDestroy> & {
	[key: symbol | string]: any;
};

export function HostObservable(): PropertyDecorator {
	return (target: AngularObject, propertyKey) => {
		let lastSub: Subscription | undefined;
		let lastObservable$: Observable<unknown> | undefined;
		let ngOnDestroy: Function | undefined;

		Object.defineProperty(target, propertyKey, {
			set: observable$ => {
				if (lastSub) lastSub.unsubscribe();

				if (!observable$ || !(observable$ instanceof Observable)) {
					console.error(target, observable$);

					throw new Error(
						`Decorated property '${String(propertyKey)}' is not an Observable`
					);
				}

				lastObservable$ = observable$;
				lastSub = observable$.subscribe();
			},
			get: () => lastObservable$,
		});

		ngOnDestroy = target.ngOnDestroy;
		const descriptor = {
			value: function () {
				ngOnDestroy?.apply(this);
				lastSub?.unsubscribe();
			},
		};

		Reflect.deleteProperty(target, 'ngOnDestroy');
		Reflect.defineProperty(target, 'ngOnDestroy', descriptor);
	};
}
