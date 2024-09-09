import { expect } from 'chai';
import { UserSession } from '@novu/testing';
import { ChannelTypeEnum, StepTypeEnum, WorkflowChannelPreferences } from '@novu/shared';
import {
  CreateWorkflowDto,
  ListWorkflowResponse,
  MinifiedResponseWorkflowDto,
  StepDto,
  WorkflowDto,
  WorkflowResponseDto,
} from './dto/workflow.dto';

const v2Prefix = '/v1/v2';
const PARTIAL_UPDATED_NAME = 'Updated';
const TEST_WORKFLOW_UPDATED_NAME = `${PARTIAL_UPDATED_NAME} Workflow Name`;
const TEST_WORKFLOW_NAME = 'Test Workflow Name';

const TEST_TAGS = ['test'];
let session: UserSession;

describe('Workflow Controller E2E API Testing', () => {
  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
  });
  it('Smoke Testing', async () => {
    const workflowCreated = await createWorkflowAndValidate();
    await getWorkflowAndValidate(workflowCreated);
    await updateWorkflowNameAndValidate({ ...workflowCreated, name: TEST_WORKFLOW_UPDATED_NAME });
    await getAllAndValidate({ searchQuery: PARTIAL_UPDATED_NAME, expectedTotalResults: 1, expectedArraySize: 1 });
    await deleteWorkflowAndValidateDeletion(workflowCreated._id);
  });
  describe('Create Workflow Permutations', () => {
    it('should not allow creating two workflows for the same user with the same name', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      const workflowCreated = await createWorkflowAndValidate(nameSuffix);
      const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto(nameSuffix);
      const res = await session.testAgent.post(`${v2Prefix}/workflows`).send(createWorkflowDto);
      expect(res.status).to.be.equal(400);
      expect(res.text).to.contain('Workflow with the same name already exists');
    });
  });
  describe('List Workflow Permutations', () => {
    it('should not return workflows with if not matching query', async () => {
      await createWorkflowAndValidate('XYZ');
      await createWorkflowAndValidate('XYZ2');
      const workflowSummaries = await getAllAndValidate({
        searchQuery: 'ABC',
        expectedTotalResults: 0,
        expectedArraySize: 0,
      });
      expect(workflowSummaries).to.be.empty;
    });
    it('should not return workflows if offset is bigger than the amount of available workflows', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      const listWorkflowResponse = await getAllAndValidate({
        searchQuery: uuid,
        offset: 11,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 0,
      });
    });
    it('should return all results within range', async () => {
      const uuid = generateUUID();

      await create10Workflows(uuid);
      const listWorkflowResponse = await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 10,
      });
    });

    it('should return  results without query', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      const listWorkflowResponse = await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 10,
      });
    });

    it('page workflows without overlap', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      const listWorkflowResponse1 = await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 5,
        expectedTotalResults: 10,
        expectedArraySize: 5,
      });
      const listWorkflowResponse2 = await getAllAndValidate({
        searchQuery: uuid,
        offset: 5,
        limit: 5,
        expectedTotalResults: 10,
        expectedArraySize: 5,
      });
      const idsDeduplicated = buildIdSet(listWorkflowResponse1, listWorkflowResponse2);
      expect(idsDeduplicated.size).to.be.equal(10);
    });
  });
});

async function createWorkflowAndValidate(nameSuffix: string = ''): Promise<WorkflowResponseDto> {
  const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto(nameSuffix);
  const res = await session.testAgent.post(`${v2Prefix}/workflows`).send(createWorkflowDto);
  expect(res.body.data).to.be.ok;
  const createdWorkflow = res.body.data;
  const createdWorkflowWithoutUpdateDate = removeFields(createdWorkflow, 'updatedAt', '_id');
  expect(createdWorkflowWithoutUpdateDate).to.deep.equal(createWorkflowDto);

  return createdWorkflow;
}

function buildPreferences(): WorkflowChannelPreferences {
  return {
    workflow: {
      defaultValue: true,
      readOnly: false,
    },
    channels: {
      [ChannelTypeEnum.IN_APP]: {
        defaultValue: true,
        readOnly: false,
      },
      [ChannelTypeEnum.EMAIL]: {
        defaultValue: false,
        readOnly: false,
      },
      [ChannelTypeEnum.SMS]: {
        defaultValue: true,
        readOnly: false,
      },
      [ChannelTypeEnum.CHAT]: {
        defaultValue: false,
        readOnly: false,
      },
      [ChannelTypeEnum.PUSH]: {
        defaultValue: true,
        readOnly: false,
      },
    },
  };
}

function buildEmailStep(): StepDto {
  return {
    active: true,
    controlValues: {},
    shouldStopOnFail: true,
    name: 'Email Test Step',
    type: StepTypeEnum.EMAIL,
  };
}

function buildInAppStep(): StepDto {
  return {
    active: true,
    controlValues: {},
    name: 'In-App Test Step',
    shouldStopOnFail: true,
    type: StepTypeEnum.IN_APP,
  };
}

function buildCreateWorkflowDto(nameSuffix: string): CreateWorkflowDto {
  return {
    name: TEST_WORKFLOW_NAME + nameSuffix,
    description: 'This is a test workflow',
    active: true,
    critical: false,
    tags: TEST_TAGS,
    notificationGroupId: session.notificationGroups[0]._id,
    preferences: buildPreferences(),
    steps: [buildEmailStep(), buildInAppStep()],
  };
}

function updateWorkflowRest(workflow: WorkflowDto & { updatedAt: string }): Promise<WorkflowResponseDto> {
  return safePut(`${v2Prefix}/workflows/${workflow._id}`, workflow);
}

function convertToDate(updatedWorkflow: WorkflowDto & { updatedAt: string }) {
  const dateString = updatedWorkflow.updatedAt; // ISO 8601 format
  const timestamp = Date.parse(dateString);

  return new Date(timestamp);
}

async function updateWorkflowNameAndValidate(workflow: WorkflowResponseDto) {
  const updatedWorkflow: WorkflowResponseDto = await updateWorkflowRest(workflow);
  const updatedWorkflowWoUpdated = removeFields(updatedWorkflow, 'updatedAt');
  const originWithoutUpdatedAt = removeFields(workflow, 'updatedAt');
  expect(updatedWorkflowWoUpdated, 'workflow after update does not match as expected').to.deep.equal(
    originWithoutUpdatedAt
  );
  expect(convertToDate(updatedWorkflow)).to.be.greaterThan(convertToDate(workflow));
}

function parseAndReturnJson(res: ApiResponse, url: string) {
  let parse: any;
  try {
    parse = JSON.parse(res.text);
  } catch (e) {
    expect.fail(
      '',
      '',
      `'Expected response to be JSON' text: ${res.text}, url: ${url}, method: ${res.req.method}, status: ${res.status}`
    );
  }
  expect(parse).to.be.ok;

  return parse.data;
}

async function safeRest<T>(
  url: string,
  method: () => Promise<ApiResponse>,
  expectedStatus: number = 200
): Promise<unknown> {
  const res: ApiResponse = await method();
  expect(res.status).to.eq(
    expectedStatus,
    `[${res.req.method}]  Failed for URL: ${url} 
    with text: 
    ${res.text}
     full response:
      ${JSON.stringify(res, null, 2)}`
  ); // Check if the status code is 200

  if (res.status !== 200) {
    return res.text;
  }

  return parseAndReturnJson(res, url);
}

async function getWorkflowRest(workflowCreated: WorkflowDto & { updatedAt: string }) {
  return await safeGet(`${v2Prefix}/workflows/${workflowCreated._id}`);
}
async function validateWorkflowDeleted(workflowId: string) {
  session.testAgent.get(`${v2Prefix}/workflows/${workflowId}`).expect(404);
}

async function getWorkflowAndValidate(workflowCreated: WorkflowResponseDto) {
  const workflowRetrieved = await getWorkflowRest(workflowCreated);
  expect(workflowRetrieved).to.deep.equal(workflowCreated);
}

async function getListWorkflows(query: string, offset: number, limit: number): Promise<ListWorkflowResponse> {
  return await safeGet(`${v2Prefix}/workflows?searchQuery=${query}&offset=${offset}&limit=${limit}`);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface AllAndValidate {
  msgPrefix?: string;
  searchQuery: string;
  offset?: number;
  limit?: number;
  expectedTotalResults: number;
  expectedArraySize: number;
}

function buildLogMsg(
  { msgPrefix = '', searchQuery = '', offset = 0, limit = 50, expectedTotalResults, expectedArraySize }: AllAndValidate,
  listWorkflowResponse: ListWorkflowResponse
): string {
  return `Log - msgPrefix: ${msgPrefix}, 
  searchQuery: ${searchQuery}, 
  offset: ${offset}, 
  limit: ${limit}, 
  expectedTotalResults: ${expectedTotalResults ?? 'Not specified'}, 
  expectedArraySize: ${expectedArraySize ?? 'Not specified'}
  response: 
  ${JSON.stringify(listWorkflowResponse || 'Not specified', null, 2)}`;
}

async function getAllAndValidate({
  msgPrefix = '',
  searchQuery = '',
  offset = 0,
  limit = 50,
  expectedTotalResults,
  expectedArraySize,
}: AllAndValidate): Promise<MinifiedResponseWorkflowDto[]> {
  const listWorkflowResponse: ListWorkflowResponse = await getListWorkflows(searchQuery, offset, limit);
  const summery: string = buildLogMsg(
    {
      msgPrefix,
      searchQuery,
      offset,
      limit,
      expectedTotalResults,
      expectedArraySize,
    },
    listWorkflowResponse
  );
  expect(listWorkflowResponse.workflowSummaries).to.be.an('array', summery);
  expect(listWorkflowResponse.workflowSummaries).lengthOf(expectedArraySize, ` workflowSummaries length${summery}`);
  expect(listWorkflowResponse.totalResults).to.be.equal(expectedTotalResults, `total Results don't match${summery}`);

  return listWorkflowResponse.workflowSummaries;
}

function deleteWorkflowRest(_id: string) {
  return safeDelete(`${v2Prefix}/workflows/${_id}`);
}

async function deleteWorkflowAndValidateDeletion(_id: string) {
  await deleteWorkflowRest(_id);
  await validateWorkflowDeleted(_id);
}

function extractIDs(workflowSummaries: MinifiedResponseWorkflowDto[]) {
  return workflowSummaries.map((workflow) => workflow._id);
}

function buildIdSet(
  listWorkflowResponse1: MinifiedResponseWorkflowDto[],
  listWorkflowResponse2: MinifiedResponseWorkflowDto[]
) {
  return new Set([...extractIDs(listWorkflowResponse1), ...extractIDs(listWorkflowResponse2)]);
}

async function create10Workflows(prefix: string) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 10; i++) {
    await createWorkflowAndValidate(`${prefix}-ABC${i}`);
  }
}
function removeFields<T>(obj: T, ...keysToRemove: (keyof T)[]): T {
  const objCopy = JSON.parse(JSON.stringify(obj));
  keysToRemove.forEach((key) => {
    delete objCopy[key as keyof T];
  });

  return objCopy;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface ApiResponse {
  req: {
    method: string; // e.g., "GET"
    url: string; // e.g., "http://127.0.0.1:1337/v1/v2/workflows/66e929c6667852862a1e5145"
    headers: {
      authorization: string; // e.g., "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      'novu-environment-id': string; // e.g., "66e929c6667852862a1e50e4"
    };
  };
  header: {
    'content-security-policy': string;
    'cross-origin-embedder-policy': string;
    'cross-origin-opener-policy': string;
    'cross-origin-resource-policy': string;
    'x-dns-prefetch-control': string;
    'x-frame-options': string;
    'strict-transport-security': string;
    'x-download-options': string;
    'x-content-type-options': string;
    'origin-agent-cluster': string;
    'x-permitted-cross-domain-policies': string;
    'referrer-policy': string;
    'x-xss-protection': string;
    'access-control-allow-origin': string;
    'content-type': string;
    'content-length': string;
    etag: string;
    vary: string;
    date: string;
    connection: string;
  };
  status: number; // e.g., 400
  text: string; // e.g., "{\"message\":\"Workflow not found with id: 66e929c6667852862a1e5145\",\"error\":\"Bad Request\",\"statusCode\":400}"
}
async function safeGet<T>(url: string): Promise<T> {
  return (await safeRest(url, () => session.testAgent.get(url) as unknown as Promise<ApiResponse>)) as T;
}
async function safePut<T>(url: string, data: object): Promise<T> {
  return (await safeRest(url, () => session.testAgent.put(url).send(data) as unknown as Promise<ApiResponse>)) as T;
}
async function safePost<T>(url: string, data: object): Promise<T> {
  return (await safeRest(url, () => session.testAgent.post(url).send(data) as unknown as Promise<ApiResponse>)) as T;
}
async function safeDelete<T>(url: string): Promise<void> {
  await safeRest(url, () => session.testAgent.delete(url) as unknown as Promise<ApiResponse>, 204);
}
function generateUUID(): string {
  // Generate a random 4-byte hex string
  const randomHex = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

  // Construct the UUID using the random hex values
  return `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
}
