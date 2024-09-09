import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { JsonSchema } from '@novu/framework';

import { NotificationStepEntity } from '@novu/dal/src';
import { OrganizationLevelCommand } from '../../../commands';

export class UpsertControlValuesCommand extends OrganizationLevelCommand {
  @IsObject()
  notificationStepEntity: NotificationStepEntity;

  @IsString()
  @IsNotEmpty()
  _workflowId: string;

  @IsObject()
  @IsOptional()
  newControlValues?: Record<string, unknown>;

  @IsObject()
  controlSchemas: { schema: JsonSchema };
}
