import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserSessionData, WorkflowOriginEnum } from '@novu/shared';
import { ExternalApiAccessible, UserAuthGuard, UserSession } from '@novu/application-generic';
import { ApiCommonResponses } from '../shared/framework/response.decorator';
import { CONTEXT_PATH } from '../../config';
import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { GetWorkflowCommand } from './usecases/get-workflow/get-workflow.command';
import { UpsertWorkflowUseCase } from './usecases/upsert-workflow/upsert-workflow.usecase';
import { UpsertWorkflowCommand } from './usecases/upsert-workflow/upsert-workflow.command';
import { GetWorkflowUseCase } from './usecases/get-workflow/get-workflow.usecase';
import { ListWorkflowsUseCase } from './usecases/list-workflows/list-workflow.usecase';
import { ListWorkflowsCommand } from './usecases/list-workflows/list-workflows.command';
import { CreateWorkflowDto, ListWorkflowResponse, UpdateWorkflowDto, WorkflowResponseDto } from './dto/workflow.dto';
import { DeleteWorkflowUseCase } from './usecases/delete-workflow/delete-workflow.usecase';
import { DeleteWorkflowCommand } from './usecases/delete-workflow/delete-workflow.command';

@ApiCommonResponses()
@Controller({ path: `${CONTEXT_PATH}v2/workflows` })
@UseInterceptors(ClassSerializerInterceptor)
@UserAuthentication()
@ApiTags('Workflows')
export class WorkflowController {
  constructor(
    private upsertWorkflowUseCase: UpsertWorkflowUseCase,
    private getWorkflowUseCase: GetWorkflowUseCase,
    private listWorkflowsUseCase: ListWorkflowsUseCase,
    private deleteWorkflowUsecase: DeleteWorkflowUseCase
  ) {}

  @Post('')
  @UseGuards(UserAuthGuard)
  create(
    @UserSession() user: UserSessionData,
    @Body() createWorkflowDto: CreateWorkflowDto
  ): Promise<WorkflowResponseDto> {
    const origin = createWorkflowDto.origin ?? WorkflowOriginEnum.NOVU;
    const creationData = {
      workflowDto: { ...createWorkflowDto, origin },
      user,
    };

    return this.upsertWorkflowUseCase.execute(UpsertWorkflowCommand.create(creationData));
  }
  @Put(':workflowId')
  @UseGuards(UserAuthGuard)
  update(
    @UserSession() user: UserSessionData,
    @Param('workflowId') workflowId: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto
  ): Promise<WorkflowResponseDto> {
    const restDataConstructed = { workflowDto: updateWorkflowDto, user, workflowDatabaseIdForUpdate: workflowId };

    return this.upsertWorkflowUseCase.execute(UpsertWorkflowCommand.create(restDataConstructed));
  }

  @Get(':workflowId')
  @ExternalApiAccessible()
  @UseGuards(UserAuthGuard)
  getWorkflow(
    @UserSession() user: UserSessionData,
    @Param('workflowId') workflowId: string
  ): Promise<WorkflowResponseDto> {
    const commandData = { _workflowId: workflowId, user };

    return this.getWorkflowUseCase.execute(GetWorkflowCommand.create(commandData));
  }

  @Delete(':workflowId')
  @ExternalApiAccessible()
  removeWorkflow(
    @UserSession() user: UserSessionData,
    @Param('workflowId') workflowId: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const data = { workflowId, user };
    this.deleteWorkflowUsecase.execute(DeleteWorkflowCommand.create(data));
    response.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('')
  @UseGuards(UserAuthGuard)
  searchWorkflows(
    @UserSession() user: UserSessionData,
    @Query() query: GetListQueryParams
  ): Promise<ListWorkflowResponse> {
    const listdata = {
      offset: query.offset ?? 0,
      limit: query.limit ?? 50,
      searchQuery: query.searchQuery,
      user,
    };

    return this.listWorkflowsUseCase.execute(ListWorkflowsCommand.create(listdata));
  }
}
interface GetListQueryParams {
  offset?: number; // Optional offset for pagination
  limit?: number; // Optional limit for pagination
  searchQuery?: string; // Optional search query string
  partialId?: string; // Optional partial ID for filtering
}
