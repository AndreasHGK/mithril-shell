export abstract class Option<T> {
  abstract orElse(fn: () => Option<T>): Option<T>;
  abstract andThen<U>(fn: (value: T) => Option<U>): Option<U>;
  abstract unwrapOr(value: T): T;

  static from<T>(value: T | null | undefined): Some<T> | None<T> {
    return value !== null && value !== undefined ? new Some(value) : new None();
  }

  isSome(): boolean {
    return this instanceof Some;
  }

  isNone(): boolean {
    return this instanceof None;
  }
}

export class Some<T> extends Option<T> {
  constructor(public value: T) {
    super();
  }

  orElse(_fn: () => Option<T>): Option<T> {
    return this;
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  unwrapOr(_value: T): T {
    return this.value;
  }
}

export class None<T> extends Option<T> {
  orElse(fn: () => Option<T>): Option<T> {
    return fn();
  }

  andThen<U>(_fn: (value: T) => Option<U>): Option<U> {
    return new None();
  }

  unwrapOr(value: T): T {
    return value;
  }
}
