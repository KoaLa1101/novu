import { BadRequestException, Injectable } from '@nestjs/common';
import defaults from 'json-schema-defaults';

import { EnvironmentRepository, NotificationTemplateRepository } from '@novu/dal';
import { Schema } from '@novu/framework';
import { ControlVariablesLevelEnum } from '@novu/shared';

import { ControlValuesEntity, ControlValuesRepository } from '@novu/dal/src';
import { GetWorkflowCommand } from './get-workflow.command';
import { StepDto, WorkflowResponseDto } from '../../dto/workflow.dto';
import { WorkflowTemplateGetMapper } from '../../mappers/workflow-template-get-mapper';

@Injectable()
export class GetWorkflowUseCase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private environmentRepository: EnvironmentRepository,
    private controlValuesRepository: ControlValuesRepository
  ) {}
  async execute(command: GetWorkflowCommand): Promise<WorkflowResponseDto> {
    await this.validateEnvironment(command);
    const notificationTemplateEntity = await this.notificationTemplateRepository.findByIdQuery({
      id: command._workflowId,
      environmentId: command.user.environmentId,
    });

    if (notificationTemplateEntity === null || notificationTemplateEntity === undefined) {
      throw new BadRequestException(`Workflow not found with id: ${command._workflowId}`);
    }

    const workflow = WorkflowTemplateGetMapper.toResponseWorkflowDto(notificationTemplateEntity);
    const stepDtos = await this.buildStepDtosWithValues(workflow.steps, command);

    return { ...workflow, steps: stepDtos };
  }

  private async buildStepDtosWithValues(
    stepDtos: Array<StepDto>,
    command: GetWorkflowCommand
  ): Promise<Array<StepDto>> {
    return await Promise.all(
      stepDtos.map(async (step) => {
        const defaultSchema = GetStepControlSchemaUsecase();
        const defaultControlValues = defaults(defaultSchema);

        const stepControlsVariables = await this.controlValuesRepository.findOne({
          _environmentId: command.user.environmentId,
          _organizationId: command.user.organizationId,
          _workflowId: command._workflowId,
          stepId: step.stepUuid,
          level: ControlVariablesLevelEnum.STEP_CONTROLS,
        });

        if (this.isContainControls(stepControlsVariables)) {
          return { ...step, controlValues: { ...defaultControlValues, ...stepControlsVariables.controls } };
        }

        return { ...step, controlValues: defaultControlValues };
      })
    );
  }

  private isContainControls(
    stepControlsVariables: ControlValuesEntity | null
  ): stepControlsVariables is ControlValuesEntity & { controls: Record<string, unknown> } {
    if (!stepControlsVariables?.controls) {
      return false;
    }

    return Object.keys(stepControlsVariables?.controls).length > 0;
  }

  private async validateEnvironment(command: GetWorkflowCommand) {
    const environment = await this.environmentRepository.findOne({ _id: command.user.environmentId });

    if (!environment) {
      throw new BadRequestException('Environment not found');
    }
  }
}

const GetStepControlSchemaUsecase = () => {
  // tmp solution, will be replaced with the dynamic control schema once PR 6482 is merged
  const emailOutputSchema = {
    type: 'object',
    properties: {
      subject: { type: 'string', default: 'Hello' },
      body: { type: 'string', default: 'World' },
    },
    required: ['subject', 'body'],
    additionalProperties: false,
  } as const satisfies Schema;

  return emailOutputSchema;
};
