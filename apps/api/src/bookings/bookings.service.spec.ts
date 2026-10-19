import { isOverlapError } from './bookings.service.js';

describe('isOverlapError', () => {
  it('recognizes the exclusion constraint error as Prisma reports it', () => {
    // Shape observed live with @prisma/adapter-pg (Prisma 7.10).
    const error = Object.assign(
      new Error(
        'Database error. Code: `23P01`. Message: `conflicting key value violates exclusion constraint "Booking_no_overlap"`',
      ),
      { code: 'P2039' },
    );
    expect(isOverlapError(error)).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isOverlapError(new Error('connection refused'))).toBe(false);
  });
});
