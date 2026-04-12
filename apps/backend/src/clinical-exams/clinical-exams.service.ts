import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateClinicalExamDto } from './dto/create-clinical-exam.dto';

const EXAM_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  examiner: { select: { id: true, name: true } },
};

@Injectable()
export class ClinicalExamsService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  private generateNumber() {
    return `EXM-${Date.now()}`;
  }

  async findAll(patientId?: string) {
    return this.tenantPrisma.client.clinicalExam.findMany({
      where: { patientId },
      include: EXAM_INCLUDE,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const exam = await this.tenantPrisma.client.clinicalExam.findFirst({
      where: { id },
      include: EXAM_INCLUDE,
    });
    if (!exam) throw new NotFoundException(`Examen ${id} no encontrado`);
    return exam;
  }

  async create(dto: CreateClinicalExamDto, examinerId: string) {
    const { farVision, nearVision, pupillaryDistance, frameMeasurements, ...rest } = dto;
    return this.tenantPrisma.client.clinicalExam.create({
      data: {
        examNumber: this.generateNumber(),
        patientId: rest.patientId,
        examinerId,
        medicalRecordId: rest.medicalRecordId,
        date: new Date(rest.date),

        farRightSphere: farVision.right.sphere,
        farRightCylinder: farVision.right.cylinder,
        farRightAxis: farVision.right.axis,
        farRightPrism: farVision.right.prism,
        farRightBase: farVision.right.base,
        farRightAddition: farVision.right.addition,

        farLeftSphere: farVision.left.sphere,
        farLeftCylinder: farVision.left.cylinder,
        farLeftAxis: farVision.left.axis,
        farLeftPrism: farVision.left.prism,
        farLeftBase: farVision.left.base,
        farLeftAddition: farVision.left.addition,

        nearRightSphere: nearVision?.right.sphere,
        nearRightCylinder: nearVision?.right.cylinder,
        nearRightAxis: nearVision?.right.axis,
        nearLeftSphere: nearVision?.left.sphere,
        nearLeftCylinder: nearVision?.left.cylinder,
        nearLeftAxis: nearVision?.left.axis,

        pdRight: pupillaryDistance.right,
        pdLeft: pupillaryDistance.left,
        pdNearRight: pupillaryDistance.nearRight,
        pdNearLeft: pupillaryDistance.nearLeft,

        frameHeight: frameMeasurements.height,
        frameRight: frameMeasurements.right,
        frameLeft: frameMeasurements.left,

        lensDataRight: rest.lensDataRight,
        lensDataLeft: rest.lensDataLeft,
        observations: rest.observations,
      },
      include: EXAM_INCLUDE,
    });
  }

  async update(id: string, dto: Partial<CreateClinicalExamDto>) {
    await this.findOne(id);
    return this.tenantPrisma.client.clinicalExam.update({
      where: { id },
      data: { observations: dto.observations },
      include: EXAM_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantPrisma.client.clinicalExam.delete({ where: { id } });
  }
}
