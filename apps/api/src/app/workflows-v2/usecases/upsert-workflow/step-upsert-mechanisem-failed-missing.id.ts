import { InternalServerErrorException } from '@nestjs/common';

export class StepUpsertMechanisemFailedMissingId extends InternalServerErrorException {
  constructor() {
    super('Upsert Mechanism Failed Missing Id');
  }
}
