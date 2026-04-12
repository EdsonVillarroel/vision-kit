import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const APPOINTMENT_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
  practitioner: { select: { id: true, name: true } },
};

@Injectable()
export class AppointmentsService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  private generateNumber() {
    return `APT-${Date.now()}`;
  }

  private calcEndTime(time: string, duration: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + duration;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  async findAll(date?: string, status?: string, practitionerId?: string) {
    return this.tenantPrisma.client.appointment.findMany({
      where: {
        date: date ? new Date(date) : undefined,
        status: status as any,
        practitionerId,
      },
      include: APPOINTMENT_INCLUDE,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findOne(id: string) {
    const a = await this.tenantPrisma.client.appointment.findFirst({
      where: { id },
      include: APPOINTMENT_INCLUDE,
    });
    if (!a) throw new NotFoundException(`Cita ${id} no encontrada`);
    return a;
  }

  async create(dto: CreateAppointmentDto, createdById: string) {
    const duration = dto.duration ?? 30;
    return this.tenantPrisma.client.appointment.create({
      data: {
        appointmentNumber: this.generateNumber(),
        patientId: dto.patientId,
        practitionerId: dto.practitionerId,
        date: new Date(dto.date),
        time: dto.time,
        duration,
        endTime: this.calcEndTime(dto.time, duration),
        type: dto.type,
        reason: dto.reason,
        notes: dto.notes,
        medicalRecordId: dto.medicalRecordId,
        createdById,
      },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    const duration = dto.duration;
    return this.tenantPrisma.client.appointment.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        endTime: dto.time && duration ? this.calcEndTime(dto.time, duration) : undefined,
        confirmedAt: dto.status === 'confirmed' ? new Date() : undefined,
        completedAt: dto.status === 'completed' ? new Date() : undefined,
        cancelledAt: dto.status === 'cancelled' ? new Date() : undefined,
      },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantPrisma.client.appointment.delete({ where: { id } });
  }

  async getAvailableSlots(date: string, practitionerId: string) {
    const booked = await this.tenantPrisma.client.appointment.findMany({
      where: {
        date: new Date(date),
        practitionerId,
        status: { notIn: ['cancelled', 'no_show'] },
      },
      select: { time: true, endTime: true },
    });

    const slots: { time: string; available: boolean }[] = [];
    for (let h = 9; h < 18; h++) {
      for (const m of [0, 30]) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const available = !booked.some((b) => b.time <= time && b.endTime > time);
        slots.push({ time, available });
      }
    }
    return slots;
  }
}
