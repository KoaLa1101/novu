import { SoftDeleteModel } from 'mongoose-delete';
import { ControlValuesModel, ControlVariables } from './controlVariables.schema';
import { ControlValuesEntity } from './controlValuesEntity';
import { BaseRepository } from '../base-repository';
import { EnforceEnvOrOrgIds } from '../../types';

export class ControlValuesRepository extends BaseRepository<
  ControlValuesModel,
  ControlValuesEntity,
  EnforceEnvOrOrgIds
> {
  private controlVariables: SoftDeleteModel;

  constructor() {
    super(ControlVariables, ControlValuesEntity);
    this.controlVariables = ControlVariables;
  }
}
