import { Module } from '@nestjs/common';
import { ClinicalExamsService } from './clinical-exams.service';
import { ClinicalExamsController } from './clinical-exams.controller';

@Module({
  providers: [ClinicalExamsService],
  controllers: [ClinicalExamsController],
})
export class ClinicalExamsModule {}
