import { PrismaService } from '@/common/prisma.service';
import { ApolloFederationDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import axios, { AxiosInstance } from 'axios';
import { parse, ObjectTypeDefinitionNode } from 'graphql';
import { AddressInfo } from 'net';
import { Task, TaskStatusResolver } from './task-status.resolver';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));

@Resolver()
class ProbeResolver {
  @Query(() => Boolean)
  probe() {
    return true;
  }
}

const query =
  'query($rows: [_Any!]!) { _entities(representations: $rows) { ... on Task { statusSummary alias: statusSummary } } }';
const entity = (id: number) => ({
  __typename: 'Task',
  nodeId: Buffer.from(JSON.stringify(['download_jobs', id])).toString('base64'),
});
const row = (id: number) => ({
  id,
  workflow: null,
  legacyStage: 'AVAILABLE',
  isFailed: false,
  isCancelled: false,
});

describe('Task status Federation HTTP resolver', () => {
  let app: INestApplication;
  let http: AxiosInstance;
  const findMany = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          driver: ApolloFederationDriver,
          autoSchemaFile: true,
          buildSchemaOptions: { orphanedTypes: [Task] },
        }),
      ],
      providers: [
        TaskStatusResolver,
        ProbeResolver,
        { provide: PrismaService, useValue: { task: { findMany } } },
      ],
    }).compile();
    app = module.createNestApplication(undefined, { logger: false });
    await app.listen(0, '127.0.0.1');
    const { port } = app.getHttpServer().address() as AddressInfo;
    http = axios.create({
      baseURL: `http://127.0.0.1:${port}`,
      proxy: false,
      validateStatus: () => true,
    });
  });

  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([]);
  });

  afterAll(async () => {
    await app?.close();
  });

  async function execute(ids: number[]) {
    const response = await http.post('/graphql', {
      query,
      variables: { rows: ids.map(entity) },
    });
    expect(response.status).toBe(200);
    return response.data;
  }

  it('exposes only a nullable status string and requires only the entity key', async () => {
    const response = await http.post('/graphql', {
      query: '{ _service { sdl } }',
    });
    expect(response.data.errors).toBeUndefined();
    const sdl = response.data.data._service.sdl;
    const task = parse(sdl).definitions.find(
      (d) => d.kind === 'ObjectTypeDefinition' && d.name.value === 'Task',
    ) as ObjectTypeDefinitionNode;
    expect(task.fields?.map((f) => f.name.value)).toEqual([
      'nodeId',
      'statusSummary',
    ]);
    expect(
      task.fields?.find((f) => f.name.value === 'statusSummary')?.type,
    ).toMatchObject({ kind: 'NamedType', name: { value: 'String' } });
    expect(sdl).toContain('@key(fields: "nodeId")');
    expect(findMany).not.toHaveBeenCalled();
  });

  it('batches tasks and aliases, maps unordered results and handles deleted tasks', async () => {
    const ids = Array.from({ length: 100 }, (_, i) => i + 1);
    findMany.mockResolvedValue(ids.map(row).reverse());
    const result = await execute([...ids, 1, 101]);
    expect(result.errors).toBeUndefined();
    expect(result.data._entities).toEqual(
      [...ids, 1, 101].map((id) => ({
        statusSummary: id === 101 ? null : 'AVAILABLE',
        alias: id === 101 ? null : 'AVAILABLE',
      })),
    );
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: [...ids, 101] } },
      select: {
        id: true,
        workflow: true,
        legacyStage: true,
        isFailed: true,
        isCancelled: true,
      },
    });
  });

  it('does not expose workflow or detail payloads and refreshes on the next request', async () => {
    const workflow = {
      schemaVersion: 1,
      definitionVersion: 1,
      status: 'running',
      currentStepId: 'step',
      createdAt: '2026-10-23T00:00:00Z',
      steps: [
        {
          id: 'step',
          atom: 'download',
          title: '下载中',
          status: 'running',
          attempt: 1,
          checkpoint: {},
        },
      ],
    };
    findMany
      .mockResolvedValueOnce([{ ...row(1), workflow }])
      .mockResolvedValueOnce([
        { ...row(1), workflow: { ...workflow, status: 'failed' } },
      ]);
    expect((await execute([1])).data._entities).toEqual([
      { statusSummary: 'download', alias: 'download' },
    ]);
    expect((await execute([1])).data._entities).toEqual([
      { statusSummary: 'DOWNLOAD_FAILED', alias: 'DOWNLOAD_FAILED' },
    ]);
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it('isolates concurrent requests and allows retry after a database failure', async () => {
    findMany.mockRejectedValueOnce(new Error('Database unavailable'));
    expect((await execute([1, 2])).errors.length).toBeGreaterThan(0);
    findMany.mockImplementation(async ({ where }) => where.id.in.map(row));
    const results = await Promise.all([execute([1]), execute([2])]);
    expect(results.every((r) => !r.errors)).toBe(true);
    expect(findMany).toHaveBeenCalledTimes(3);
  });

  it('keeps valid summaries when another task has a corrupt workflow', async () => {
    findMany.mockResolvedValue([{ ...row(1), workflow: {} }, row(2)]);
    const result = await execute([1, 2]);
    expect(result.errors).toBeUndefined();
    expect(result.data._entities).toEqual([
      { statusSummary: null, alias: null },
      { statusSummary: 'AVAILABLE', alias: 'AVAILABLE' },
    ]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
