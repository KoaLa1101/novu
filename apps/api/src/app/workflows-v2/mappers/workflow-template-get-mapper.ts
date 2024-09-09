import { IPreferenceChannels, StepTypeEnum } from '@novu/shared';
import { DiscoverWorkflowOutputPreferences } from '@novu/framework';
import { NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';

import { MinifiedResponseWorkflowDto, StepDto, WorkflowResponseDto } from '../dto/workflow.dto';

export class WorkflowTemplateGetMapper {
  static toResponseWorkflowDto(template: NotificationTemplateEntity): WorkflowResponseDto {
    return {
      _id: template._id,
      tags: template.tags,
      active: template.active,
      critical: template.critical,
      notificationGroupId: template._notificationGroupId,
      preferences: WorkflowTemplateGetMapper.toPreferences(template.preferenceSettings), // Assuming this directly maps; may need adjustment
      steps: template.steps.map(WorkflowTemplateGetMapper.toStepDto),
      name: template.name,
      description: template.description,
      origin: template.origin,
      updatedAt: template.updatedAt || 'Missing Updated At',
    };
  }
  static toMinifiedWorkflowDto(template: NotificationTemplateEntity): MinifiedResponseWorkflowDto {
    return {
      _id: template._id,
      name: template.name,
      tags: template.tags,
      updatedAt: template.updatedAt || 'Missing Updated At',
      stepSummery: template.steps.map(WorkflowTemplateGetMapper.buildStepSummery),
    };
  }

  static toWorkflowsMinifiedDtos(templates: NotificationTemplateEntity[]): MinifiedResponseWorkflowDto[] {
    return templates.map(WorkflowTemplateGetMapper.toMinifiedWorkflowDto);
  }
  static toStepDto(step: NotificationStepEntity): StepDto {
    return {
      name: step.name || 'Missing Name',
      stepUuid: step._templateId,
      type: step.template?.type || StepTypeEnum.EMAIL,
      controls: WorkflowTemplateGetMapper.convertControls(step),
      active: step.active || true,
      shouldStopOnFail: step.shouldStopOnFail || true,
      controlValues: step.controlVariables || {},
    };
  }

  private static convertControls(step: NotificationStepEntity) {
    if (step.template?.controls) {
      return { schema: step.template.controls.schema };
    } else {
      return undefined;
    }
  }

  private static toPreferences(preferenceSettings: IPreferenceChannels): DiscoverWorkflowOutputPreferences {
    const { email } = preferenceSettings;
    const { sms } = preferenceSettings;
    const { push } = preferenceSettings;
    const { chat } = preferenceSettings;
    const inApp = preferenceSettings.in_app;
    return {
      workflow: { defaultValue: true, readOnly: false },
      channels: {
        email: { defaultValue: email ?? true, readOnly: false },
        sms: { defaultValue: sms ?? true, readOnly: false },
        push: { defaultValue: push ?? true, readOnly: false },
        chat: { defaultValue: chat ?? true, readOnly: false },
        in_app: { defaultValue: inApp ?? true, readOnly: false },
      },
    };
  }

  private static buildStepSummery(step: NotificationStepEntity) {
    return step.template?.type || StepTypeEnum.EMAIL;
  }
}
