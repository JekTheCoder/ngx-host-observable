import { OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

type AngularObject = Partial<OnDestroy> & {
	[key: symbol | string]: any;
};

export function HostObservable(): PropertyDecorator {
	return (target: AngularObject, propertyKey) => {
		let lastPropery: Subscription | undefined;
		let ngOnDestroy: Function | undefined;

		Object.defineProperty(target, propertyKey, {
			set: property => {
				if (lastPropery) lastPropery.unsubscribe();

				if (!property || !(property instanceof Observable)) {
					console.error(target, property);

					throw new Error(
						`Decorated property '${String(propertyKey)}' is not an Observable`
					);
				}

				lastPropery = property.subscribe();
			},
		});

		ngOnDestroy = target.ngOnDestroy;
		const descriptor = {
			value: function () {
				ngOnDestroy?.apply(this);
				lastPropery?.unsubscribe();
			},
		};

		Reflect.deleteProperty(target, 'ngOnDestroy');
		Reflect.defineProperty(target, 'ngOnDestroy', descriptor);
	};
}
