export const ONE_MINUTE = 1000 * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;

export class TimeServiceMock {
  private currentNow: number = 0;

  constructor() {}

  now(): number {
    return this.currentNow;
  }

  setNow(now: number) {
    this.currentNow = now;
  }
}
