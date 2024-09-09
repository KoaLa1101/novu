import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { RequiredProp } from '../../customTypes';
import { CreateWorkflowDto } from '../../dto/workflow.dto';

export class UpsertWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflowDatabaseIdForUpdate?: string;
  workflowDto: RequiredProp<CreateWorkflowDto, 'origin'>;
}
