import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateTimeOffDto, WeeklyRangeDto } from './schedule.dto.js';

const WEEKDAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

/**
 * Returns an error message if the ranges are invalid (end before start, or two
 * ranges of the same day overlapping), or null if they are fine.
 */
export function findScheduleError(ranges: WeeklyRangeDto[]): string | null {
  for (const range of ranges) {
    if (range.startMinutes >= range.endMinutes) {
      return `Hay una franja del ${WEEKDAY_NAMES[range.weekday]} que termina antes de empezar.`;
    }
  }
  const sorted = [...ranges].sort(
    (a, b) => a.weekday - b.weekday || a.startMinutes - b.startMinutes,
  );
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    if (
      previous.weekday === current.weekday &&
      current.startMinutes < previous.endMinutes
    ) {
      return `Dos franjas del ${WEEKDAY_NAMES[current.weekday]} se superponen.`;
    }
  }
  return null;
}

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  getWeekly() {
    return this.prisma.weeklySchedule.findMany({
      orderBy: [{ weekday: 'asc' }, { startMinutes: 'asc' }],
    });
  }

  /** Replaces the whole weekly schedule in one transaction. */
  async replaceWeekly(ranges: WeeklyRangeDto[]) {
    const error = findScheduleError(ranges);
    if (error) throw new BadRequestException(error);
    await this.prisma.$transaction([
      this.prisma.weeklySchedule.deleteMany(),
      this.prisma.weeklySchedule.createMany({ data: ranges }),
    ]);
    return this.getWeekly();
  }

  /** Time off that has not ended yet, soonest first. */
  getUpcomingTimeOff() {
    return this.prisma.timeOff.findMany({
      where: { endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    });
  }

  createTimeOff(data: CreateTimeOffDto) {
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);
    if (startsAt >= endsAt) {
      throw new BadRequestException(
        'El bloqueo tiene que terminar después de empezar.',
      );
    }
    return this.prisma.timeOff.create({
      data: { startsAt, endsAt, reason: data.reason?.trim() || null },
    });
  }

  async removeTimeOff(id: number) {
    const { count } = await this.prisma.timeOff.deleteMany({ where: { id } });
    if (count === 0) throw new NotFoundException('El bloqueo no existe.');
  }
}
