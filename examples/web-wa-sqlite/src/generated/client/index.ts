import { z } from 'zod';
import type { Prisma } from './prismaClient';
import { type TableSchema, DbSchema, ElectricClient, type HKT } from 'electric-sql/client/model';
import migrations from './migrations';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const QueryModeSchema = z.enum(['default','insensitive']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const TetrominoesScalarFieldEnumSchema = z.enum(['id','shape','colour','angle']);

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const colourSchema = z.enum(['red','yellow','purple','cyan','green']);

export type colourType = `${z.infer<typeof colourSchema>}`

export const tetrominoSchema = z.enum(['straight','square','skew','T_shaped','L_shaped']);

export type tetrominoType = `${z.infer<typeof tetrominoSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// TETROMINOES SCHEMA
/////////////////////////////////////////

export const TetrominoesSchema = z.object({
  shape: tetrominoSchema,
  colour: colourSchema,
  id: z.string().uuid(),
  angle: z.number().int().gte(-2147483648).lte(2147483647).nullable(),
})

export type Tetrominoes = z.infer<typeof TetrominoesSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// TETROMINOES
//------------------------------------------------------

export const TetrominoesSelectSchema: z.ZodType<Prisma.TetrominoesSelect> = z.object({
  id: z.boolean().optional(),
  shape: z.boolean().optional(),
  colour: z.boolean().optional(),
  angle: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const TetrominoesWhereInputSchema: z.ZodType<Prisma.TetrominoesWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TetrominoesWhereInputSchema),z.lazy(() => TetrominoesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TetrominoesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TetrominoesWhereInputSchema),z.lazy(() => TetrominoesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema),z.string() ]).optional(),
  shape: z.union([ z.lazy(() => EnumtetrominoFilterSchema),z.lazy(() => tetrominoSchema) ]).optional(),
  colour: z.union([ z.lazy(() => EnumcolourFilterSchema),z.lazy(() => colourSchema) ]).optional(),
  angle: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
}).strict();

export const TetrominoesOrderByWithRelationInputSchema: z.ZodType<Prisma.TetrominoesOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shape: z.lazy(() => SortOrderSchema).optional(),
  colour: z.lazy(() => SortOrderSchema).optional(),
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TetrominoesWhereUniqueInputSchema: z.ZodType<Prisma.TetrominoesWhereUniqueInput> = z.object({
  id: z.string().uuid().optional()
}).strict();

export const TetrominoesOrderByWithAggregationInputSchema: z.ZodType<Prisma.TetrominoesOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shape: z.lazy(() => SortOrderSchema).optional(),
  colour: z.lazy(() => SortOrderSchema).optional(),
  angle: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TetrominoesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TetrominoesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TetrominoesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TetrominoesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TetrominoesSumOrderByAggregateInputSchema).optional()
}).strict();

export const TetrominoesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TetrominoesScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TetrominoesScalarWhereWithAggregatesInputSchema),z.lazy(() => TetrominoesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TetrominoesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TetrominoesScalarWhereWithAggregatesInputSchema),z.lazy(() => TetrominoesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema),z.string() ]).optional(),
  shape: z.union([ z.lazy(() => EnumtetrominoWithAggregatesFilterSchema),z.lazy(() => tetrominoSchema) ]).optional(),
  colour: z.union([ z.lazy(() => EnumcolourWithAggregatesFilterSchema),z.lazy(() => colourSchema) ]).optional(),
  angle: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
}).strict();

export const TetrominoesCreateInputSchema: z.ZodType<Prisma.TetrominoesCreateInput> = z.object({
  id: z.string().uuid(),
  shape: z.lazy(() => tetrominoSchema),
  colour: z.lazy(() => colourSchema),
  angle: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable()
}).strict();

export const TetrominoesUncheckedCreateInputSchema: z.ZodType<Prisma.TetrominoesUncheckedCreateInput> = z.object({
  id: z.string().uuid(),
  shape: z.lazy(() => tetrominoSchema),
  colour: z.lazy(() => colourSchema),
  angle: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable()
}).strict();

export const TetrominoesUpdateInputSchema: z.ZodType<Prisma.TetrominoesUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shape: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => EnumtetrominoFieldUpdateOperationsInputSchema) ]).optional(),
  colour: z.union([ z.lazy(() => colourSchema),z.lazy(() => EnumcolourFieldUpdateOperationsInputSchema) ]).optional(),
  angle: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TetrominoesUncheckedUpdateInputSchema: z.ZodType<Prisma.TetrominoesUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shape: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => EnumtetrominoFieldUpdateOperationsInputSchema) ]).optional(),
  colour: z.union([ z.lazy(() => colourSchema),z.lazy(() => EnumcolourFieldUpdateOperationsInputSchema) ]).optional(),
  angle: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TetrominoesCreateManyInputSchema: z.ZodType<Prisma.TetrominoesCreateManyInput> = z.object({
  id: z.string().uuid(),
  shape: z.lazy(() => tetrominoSchema),
  colour: z.lazy(() => colourSchema),
  angle: z.number().int().gte(-2147483648).lte(2147483647).optional().nullable()
}).strict();

export const TetrominoesUpdateManyMutationInputSchema: z.ZodType<Prisma.TetrominoesUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shape: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => EnumtetrominoFieldUpdateOperationsInputSchema) ]).optional(),
  colour: z.union([ z.lazy(() => colourSchema),z.lazy(() => EnumcolourFieldUpdateOperationsInputSchema) ]).optional(),
  angle: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TetrominoesUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TetrominoesUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shape: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => EnumtetrominoFieldUpdateOperationsInputSchema) ]).optional(),
  colour: z.union([ z.lazy(() => colourSchema),z.lazy(() => EnumcolourFieldUpdateOperationsInputSchema) ]).optional(),
  angle: z.union([ z.number().int().gte(-2147483648).lte(2147483647),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UuidFilterSchema: z.ZodType<Prisma.UuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const EnumtetrominoFilterSchema: z.ZodType<Prisma.EnumtetrominoFilter> = z.object({
  equals: z.lazy(() => tetrominoSchema).optional(),
  in: z.lazy(() => tetrominoSchema).array().optional(),
  notIn: z.lazy(() => tetrominoSchema).array().optional(),
  not: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => NestedEnumtetrominoFilterSchema) ]).optional(),
}).strict();

export const EnumcolourFilterSchema: z.ZodType<Prisma.EnumcolourFilter> = z.object({
  equals: z.lazy(() => colourSchema).optional(),
  in: z.lazy(() => colourSchema).array().optional(),
  notIn: z.lazy(() => colourSchema).array().optional(),
  not: z.union([ z.lazy(() => colourSchema),z.lazy(() => NestedEnumcolourFilterSchema) ]).optional(),
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const TetrominoesCountOrderByAggregateInputSchema: z.ZodType<Prisma.TetrominoesCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shape: z.lazy(() => SortOrderSchema).optional(),
  colour: z.lazy(() => SortOrderSchema).optional(),
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TetrominoesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TetrominoesAvgOrderByAggregateInput> = z.object({
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TetrominoesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TetrominoesMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shape: z.lazy(() => SortOrderSchema).optional(),
  colour: z.lazy(() => SortOrderSchema).optional(),
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TetrominoesMinOrderByAggregateInputSchema: z.ZodType<Prisma.TetrominoesMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shape: z.lazy(() => SortOrderSchema).optional(),
  colour: z.lazy(() => SortOrderSchema).optional(),
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TetrominoesSumOrderByAggregateInputSchema: z.ZodType<Prisma.TetrominoesSumOrderByAggregateInput> = z.object({
  angle: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UuidWithAggregatesFilterSchema: z.ZodType<Prisma.UuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumtetrominoWithAggregatesFilterSchema: z.ZodType<Prisma.EnumtetrominoWithAggregatesFilter> = z.object({
  equals: z.lazy(() => tetrominoSchema).optional(),
  in: z.lazy(() => tetrominoSchema).array().optional(),
  notIn: z.lazy(() => tetrominoSchema).array().optional(),
  not: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => NestedEnumtetrominoWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumtetrominoFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumtetrominoFilterSchema).optional()
}).strict();

export const EnumcolourWithAggregatesFilterSchema: z.ZodType<Prisma.EnumcolourWithAggregatesFilter> = z.object({
  equals: z.lazy(() => colourSchema).optional(),
  in: z.lazy(() => colourSchema).array().optional(),
  notIn: z.lazy(() => colourSchema).array().optional(),
  not: z.union([ z.lazy(() => colourSchema),z.lazy(() => NestedEnumcolourWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumcolourFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumcolourFilterSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const EnumtetrominoFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumtetrominoFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => tetrominoSchema).optional()
}).strict();

export const EnumcolourFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumcolourFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => colourSchema).optional()
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const NestedUuidFilterSchema: z.ZodType<Prisma.NestedUuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const NestedEnumtetrominoFilterSchema: z.ZodType<Prisma.NestedEnumtetrominoFilter> = z.object({
  equals: z.lazy(() => tetrominoSchema).optional(),
  in: z.lazy(() => tetrominoSchema).array().optional(),
  notIn: z.lazy(() => tetrominoSchema).array().optional(),
  not: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => NestedEnumtetrominoFilterSchema) ]).optional(),
}).strict();

export const NestedEnumcolourFilterSchema: z.ZodType<Prisma.NestedEnumcolourFilter> = z.object({
  equals: z.lazy(() => colourSchema).optional(),
  in: z.lazy(() => colourSchema).array().optional(),
  notIn: z.lazy(() => colourSchema).array().optional(),
  not: z.union([ z.lazy(() => colourSchema),z.lazy(() => NestedEnumcolourFilterSchema) ]).optional(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedUuidWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedEnumtetrominoWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumtetrominoWithAggregatesFilter> = z.object({
  equals: z.lazy(() => tetrominoSchema).optional(),
  in: z.lazy(() => tetrominoSchema).array().optional(),
  notIn: z.lazy(() => tetrominoSchema).array().optional(),
  not: z.union([ z.lazy(() => tetrominoSchema),z.lazy(() => NestedEnumtetrominoWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumtetrominoFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumtetrominoFilterSchema).optional()
}).strict();

export const NestedEnumcolourWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumcolourWithAggregatesFilter> = z.object({
  equals: z.lazy(() => colourSchema).optional(),
  in: z.lazy(() => colourSchema).array().optional(),
  notIn: z.lazy(() => colourSchema).array().optional(),
  not: z.union([ z.lazy(() => colourSchema),z.lazy(() => NestedEnumcolourWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumcolourFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumcolourFilterSchema).optional()
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const TetrominoesFindFirstArgsSchema: z.ZodType<Prisma.TetrominoesFindFirstArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereInputSchema.optional(),
  orderBy: z.union([ TetrominoesOrderByWithRelationInputSchema.array(),TetrominoesOrderByWithRelationInputSchema ]).optional(),
  cursor: TetrominoesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TetrominoesScalarFieldEnumSchema.array().optional(),
}).strict() 

export const TetrominoesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TetrominoesFindFirstOrThrowArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereInputSchema.optional(),
  orderBy: z.union([ TetrominoesOrderByWithRelationInputSchema.array(),TetrominoesOrderByWithRelationInputSchema ]).optional(),
  cursor: TetrominoesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TetrominoesScalarFieldEnumSchema.array().optional(),
}).strict() 

export const TetrominoesFindManyArgsSchema: z.ZodType<Prisma.TetrominoesFindManyArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereInputSchema.optional(),
  orderBy: z.union([ TetrominoesOrderByWithRelationInputSchema.array(),TetrominoesOrderByWithRelationInputSchema ]).optional(),
  cursor: TetrominoesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: TetrominoesScalarFieldEnumSchema.array().optional(),
}).strict() 

export const TetrominoesAggregateArgsSchema: z.ZodType<Prisma.TetrominoesAggregateArgs> = z.object({
  where: TetrominoesWhereInputSchema.optional(),
  orderBy: z.union([ TetrominoesOrderByWithRelationInputSchema.array(),TetrominoesOrderByWithRelationInputSchema ]).optional(),
  cursor: TetrominoesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() 

export const TetrominoesGroupByArgsSchema: z.ZodType<Prisma.TetrominoesGroupByArgs> = z.object({
  where: TetrominoesWhereInputSchema.optional(),
  orderBy: z.union([ TetrominoesOrderByWithAggregationInputSchema.array(),TetrominoesOrderByWithAggregationInputSchema ]).optional(),
  by: TetrominoesScalarFieldEnumSchema.array(),
  having: TetrominoesScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() 

export const TetrominoesFindUniqueArgsSchema: z.ZodType<Prisma.TetrominoesFindUniqueArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereUniqueInputSchema,
}).strict() 

export const TetrominoesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TetrominoesFindUniqueOrThrowArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereUniqueInputSchema,
}).strict() 

export const TetrominoesCreateArgsSchema: z.ZodType<Prisma.TetrominoesCreateArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  data: z.union([ TetrominoesCreateInputSchema,TetrominoesUncheckedCreateInputSchema ]),
}).strict() 

export const TetrominoesUpsertArgsSchema: z.ZodType<Prisma.TetrominoesUpsertArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereUniqueInputSchema,
  create: z.union([ TetrominoesCreateInputSchema,TetrominoesUncheckedCreateInputSchema ]),
  update: z.union([ TetrominoesUpdateInputSchema,TetrominoesUncheckedUpdateInputSchema ]),
}).strict() 

export const TetrominoesCreateManyArgsSchema: z.ZodType<Prisma.TetrominoesCreateManyArgs> = z.object({
  data: TetrominoesCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict() 

export const TetrominoesDeleteArgsSchema: z.ZodType<Prisma.TetrominoesDeleteArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  where: TetrominoesWhereUniqueInputSchema,
}).strict() 

export const TetrominoesUpdateArgsSchema: z.ZodType<Prisma.TetrominoesUpdateArgs> = z.object({
  select: TetrominoesSelectSchema.optional(),
  data: z.union([ TetrominoesUpdateInputSchema,TetrominoesUncheckedUpdateInputSchema ]),
  where: TetrominoesWhereUniqueInputSchema,
}).strict() 

export const TetrominoesUpdateManyArgsSchema: z.ZodType<Prisma.TetrominoesUpdateManyArgs> = z.object({
  data: z.union([ TetrominoesUpdateManyMutationInputSchema,TetrominoesUncheckedUpdateManyInputSchema ]),
  where: TetrominoesWhereInputSchema.optional(),
}).strict() 

export const TetrominoesDeleteManyArgsSchema: z.ZodType<Prisma.TetrominoesDeleteManyArgs> = z.object({
  where: TetrominoesWhereInputSchema.optional(),
}).strict() 

interface TetrominoesGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.TetrominoesArgs
  readonly type: Omit<Prisma.TetrominoesGetPayload<this['_A']>, "Please either choose `select` or `include`">
}

export const tableSchemas = {
  tetrominoes: {
    fields: new Map([
      [
        "id",
        "UUID"
      ],
      [
        "shape",
        "TEXT"
      ],
      [
        "colour",
        "TEXT"
      ],
      [
        "angle",
        "INT4"
      ]
    ]),
    relations: [
    ],
    modelSchema: (TetrominoesCreateInputSchema as any)
      .partial()
      .or((TetrominoesUncheckedCreateInputSchema as any).partial()),
    createSchema: TetrominoesCreateArgsSchema,
    createManySchema: TetrominoesCreateManyArgsSchema,
    findUniqueSchema: TetrominoesFindUniqueArgsSchema,
    findSchema: TetrominoesFindFirstArgsSchema,
    updateSchema: TetrominoesUpdateArgsSchema,
    updateManySchema: TetrominoesUpdateManyArgsSchema,
    upsertSchema: TetrominoesUpsertArgsSchema,
    deleteSchema: TetrominoesDeleteArgsSchema,
    deleteManySchema: TetrominoesDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof TetrominoesUncheckedCreateInputSchema>,
    Prisma.TetrominoesCreateArgs['data'],
    Prisma.TetrominoesUpdateArgs['data'],
    Prisma.TetrominoesFindFirstArgs['select'],
    Prisma.TetrominoesFindFirstArgs['where'],
    Prisma.TetrominoesFindUniqueArgs['where'],
    never,
    Prisma.TetrominoesFindFirstArgs['orderBy'],
    Prisma.TetrominoesScalarFieldEnum,
    TetrominoesGetPayload
  >,
}

export const schema = new DbSchema(tableSchemas, migrations)
export type Electric = ElectricClient<typeof schema>
