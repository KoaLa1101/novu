import { Injectable } from '@nestjs/common';
import _ from 'lodash';

import { ControlValuesEntity, ControlValuesRepository } from '@novu/dal';
import { ControlVariablesLevelEnum } from '@novu/shared';

import { UpsertControlValuesCommand } from './upsert-control-values.command';

@Injectable()
export class UpsertControlValuesUseCase {
  constructor(private controlValuesRepository: ControlValuesRepository) {}

  async execute(command: UpsertControlValuesCommand) {
    const controlValues = this.difference(
      command.notificationStepEntity.controlVariables,
      command.controlSchemas.schema,
    );

    const existingControlValues = await this.controlValuesRepository.findOne({
      _environmentId: command.environmentId,
      _workflowId: command._workflowId,
      level: ControlVariablesLevelEnum.STEP_CONTROLS,
      priority: 0,
      _stepId: command.notificationStepEntity._templateId,
    });

    if (existingControlValues) {
      return await this.updateControlVariables(
        existingControlValues,
        command,
        controlValues,
      );
    }

    return await this.controlValuesRepository.create({
      _organizationId: command.organizationId,
      _environmentId: command.environmentId,
      _workflowId: command._workflowId,
      _stepId: command.notificationStepEntity._templateId,
      level: ControlVariablesLevelEnum.STEP_CONTROLS,
      priority: 0,
      inputs: controlValues,
      controls: controlValues,
    });
  }

  private async updateControlVariables(
    found: ControlValuesEntity,
    command: UpsertControlValuesCommand,
    controlValues: Record<string, unknown>,
  ) {
    await this.controlValuesRepository.update(
      {
        _id: found._id,
        _organizationId: command.organizationId,
        _environmentId: command.environmentId,
      },
      {
        level: ControlVariablesLevelEnum.STEP_CONTROLS,
        priority: 0,
        inputs: controlValues,
        controls: controlValues,
      },
    );

    return this.controlValuesRepository.findOne({
      _id: found._id,
      _organizationId: command.organizationId,
      _environmentId: command.environmentId,
    });
  }

  private difference(object, base) {
    const changes = (objectControl, baseControl) => {
      return _.transform(objectControl, function (result, value, key) {
        if (!_.isEqual(value, base[key])) {
          // eslint-disable-next-line no-param-reassign
          result[key] =
            _.isObject(value) && _.isObject(baseControl[key])
              ? changes(value, baseControl[key])
              : value;
        }
      });
    };

    return changes(object, base);
  }
}
