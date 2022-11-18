# NgxHostObservable

An angular library for automated and secure obseravable suscribing and unsubscribing.

## Getting Started

### Installation

```bash
npm install ngx-host-observable
yarn add ngx-host-observable
pnpm add ngx-host-observable
```

### Example Usage

Just decorate your observable property with _@HostObservable_

```ts
import { HostObservable } from 'ngx-host-observable';
import { interval } from 'rxjs';

@Component({ ... })
export class MyComponent {
	@HostObservable()
	timer$ = interval(1000).pipe(
		tap(seconds => console.log(seconds + ' seconds has passed'))
	);
}
```

That's all!
The observable is going to be suscribed on the component creation and unsuscribed on component destroy.

## Recommended

### Accessing Observable

It is possible to reuse the same observable within your application

```ts
import { HostObservable } from 'ngx-host-observable';
import { interval, scan } from 'rxjs';

@Component({ ... })
export class MyComponent implements OnInit {
	@HostObservable()
	timer$ = interval(1000).pipe(tap(console.log));

	loading$?: Observable<boolean>;

	ngOnInit() {
		// Complete loading when timer$ reaches 10 seconds
		loading$ = this.timer$.pipe(
			scan(times => times + 1, 0), 
			filter(times => times === 10), 
			map(() => false), 
			startWith(true), take(2)
		);
	}
}
```

### Warning

Even though it's possible to re use the same decorated observable, there is one case where you not supposed to use it. 

Because of the way of how decorators work in Typescript, in order to access the decorated observable is necessary to stablish getter and setter methods for the property

```ts
Object.defineProperty(target, propertyKey, {
	set: observable$ => {
		...
	},
	get: () => ...
});
```

This does not have any impact on typescript itself and you can get the value safely, but in angular templates, getting value from getters and functions is a huge performance killer.

```ts example-bad
@Component({
	...,
	template: '<span>{{ timer$ | async }} seconds passed</span>'
})
export class MyComponent implements OnInit {
	@HostObservable()
	timer$ = interval(1000).pipe(tap(console.log));
}
```

This is because angular reevaluates templates bindings on each tick. You can read more about [here](https://medium.com/showpad-engineering/why-you-should-never-use-function-calls-in-angular-template-expressions-e1a50f9c0496).

To solve this problem just remove the decorator. All is going to work the same because async pipe suscribes and unsuscribes automatically your observable.

```ts example-good
@Component({
	...,
	template: '<span>{{ timer$ | async }} seconds passed</span>'
})
export class MyComponent implements OnInit {
	timer$ = interval(1000).pipe(tap(console.log));
}
```