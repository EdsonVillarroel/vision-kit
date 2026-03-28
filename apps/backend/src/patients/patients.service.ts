import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

const PATIENT_INCLUDE = {
  insurance: true,
  emergencyContact: true,
};

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { identificationId: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: PATIENT_INCLUDE,
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: PATIENT_INCLUDE,
    });
    if (!patient) throw new NotFoundException(`Paciente ${id} no encontrado`);
    return patient;
  }

  async create(dto: CreatePatientDto) {
    const { insurance, emergencyContact, ...data } = dto;
    return this.prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        insurance: insurance ? { create: insurance } : undefined,
        emergencyContact: { create: emergencyContact },
      },
      include: PATIENT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);
    const { insurance, emergencyContact, ...data } = dto;
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        insurance: insurance
          ? { upsert: { create: insurance, update: insurance } }
          : undefined,
        emergencyContact: emergencyContact
          ? { upsert: { create: emergencyContact, update: emergencyContact } }
          : undefined,
      },
      include: PATIENT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.patient.delete({ where: { id } });
  }

  async getMedicalHistory(id: string) {
    await this.findOne(id);
    return this.prisma.medicalRecord.findMany({
      where: { patientId: id },
      orderBy: { date: 'desc' },
    });
  }

  async getSales(id: string) {
    await this.findOne(id);
    return this.prisma.sale.findMany({
      where: { patientId: id },
      include: { items: true },
      orderBy: { date: 'desc' },
    });
  }
}
