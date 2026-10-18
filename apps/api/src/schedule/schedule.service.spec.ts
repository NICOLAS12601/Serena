import { findScheduleError } from './schedule.service.js';

const range = (weekday: number, from: string, to: string) => {
  const minutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  return { weekday, startMinutes: minutes(from), endMinutes: minutes(to) };
};

describe('findScheduleError', () => {
  it('accepts split shifts on the same day', () => {
    expect(
      findScheduleError([
        range(2, '09:00', '13:00'),
        range(2, '15:00', '19:00'),
      ]),
    ).toBeNull();
  });

  it('accepts ranges that touch (one ends when the next starts)', () => {
    expect(
      findScheduleError([
        range(2, '09:00', '13:00'),
        range(2, '13:00', '15:00'),
      ]),
    ).toBeNull();
  });

  it('rejects overlapping ranges on the same day', () => {
    expect(
      findScheduleError([
        range(3, '09:00', '13:00'),
        range(3, '12:00', '16:00'),
      ]),
    ).toBe('Dos franjas del miércoles se superponen.');
  });

  it('allows the same hours on different days', () => {
    expect(
      findScheduleError([
        range(1, '09:00', '13:00'),
        range(2, '09:00', '13:00'),
      ]),
    ).toBeNull();
  });

  it('rejects a range that ends before it starts', () => {
    expect(findScheduleError([range(5, '18:00', '10:00')])).toBe(
      'Hay una franja del viernes que termina antes de empezar.',
    );
  });
});
