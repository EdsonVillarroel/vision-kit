import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  async findAll(patientId?: string) {
    return this.tenantPrisma.client.medicalRecord.findMany({
      where: { patientId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        practitioner: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.tenantPrisma.client.medicalRecord.findFirst({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        practitioner: { select: { id: true, name: true } },
        clinicalExam: true,
      },
    });
    if (!record) throw new NotFoundException(`Historial ${id} no encontrado`);
    return record;
  }

  async create(dto: CreateMedicalRecordDto, practitionerId: string) {
    const { visualAcuity, refraction, prescription, intraocularPressure, ...rest } = dto;

    return this.tenantPrisma.client.medicalRecord.create({
      data: {
        patientId: rest.patientId,
        practitionerId,
        date: new Date(rest.date),
        examType: rest.examType,
        diagnosis: rest.diagnosis ?? [],
        notes: rest.notes,
        nextVisitRecommended: rest.nextVisitRecommended ? new Date(rest.nextVisitRecommended) : null,

        vaRightUncorrected: visualAcuity.right.uncorrected,
        vaRightCorrected: visualAcuity.right.corrected,
        vaLeftUncorrected: visualAcuity.left.uncorrected,
        vaLeftCorrected: visualAcuity.left.corrected,

        refractionRightSphere: refraction.right.sphere,
        refractionRightCylinder: refraction.right.cylinder,
        refractionRightAxis: refraction.right.axis,
        refractionRightAdd: refraction.right.add,
        refractionRightPd: refraction.right.pd,

        refractionLeftSphere: refraction.left.sphere,
        refractionLeftCylinder: refraction.left.cylinder,
        refractionLeftAxis: refraction.left.axis,
        refractionLeftAdd: refraction.left.add,
        refractionLeftPd: refraction.left.pd,

        prescriptionRightSphere: prescription?.right.sphere,
        prescriptionRightCylinder: prescription?.right.cylinder,
        prescriptionRightAxis: prescription?.right.axis,
        prescriptionLeftSphere: prescription?.left.sphere,
        prescriptionLeftCylinder: prescription?.left.cylinder,
        prescriptionLeftAxis: prescription?.left.axis,

        iopRight: intraocularPressure?.right,
        iopLeft: intraocularPressure?.left,
      },
    });
  }

  async update(id: string, dto: Partial<CreateMedicalRecordDto>) {
    await this.findOne(id);
    return this.tenantPrisma.client.medicalRecord.update({
      where: { id },
      data: {
        notes: dto.notes,
        diagnosis: dto.diagnosis,
        nextVisitRecommended: dto.nextVisitRecommended
          ? new Date(dto.nextVisitRecommended)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantPrisma.client.medicalRecord.delete({ where: { id } });
  }
}
