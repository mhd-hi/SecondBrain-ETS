/* eslint-disable react/no-unnecessary-use-prefix */
/* eslint-disable ts/no-explicit-any */
/* eslint-disable ts/ban-ts-comment */
export function ensureViSetSystemTime(vi: any) {
  if (typeof vi?.setSystemTime === 'function') {
    return;
  }

  const OriginalDate = Date;
  let _fakeNow: number | null = null;

  class FakeDate extends OriginalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(_fakeNow != null ? _fakeNow : OriginalDate.now());
      } else {
        // @ts-ignore
        super(...args);
      }
    }

    static now() {
      return _fakeNow != null ? _fakeNow : OriginalDate.now();
    }
  }

  Object.getOwnPropertyNames(OriginalDate).forEach((key) => {
    try {
      // @ts-ignore
      (FakeDate as any)[key] = (OriginalDate as any)[key];
    } catch { }
  });

  function setSystemTime(date: Date | number) {
    _fakeNow = new OriginalDate(date).getTime();
    // @ts-ignore
    (globalThis as any).Date = FakeDate;
  }

  function useRealTimers() {
    // @ts-ignore
    (globalThis as any).Date = OriginalDate;
    _fakeNow = null;
  }

  vi.setSystemTime = setSystemTime;
  if (typeof vi.useRealTimers !== 'function') {
    vi.useRealTimers = useRealTimers;
  }
}
