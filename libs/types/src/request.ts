import z from 'zod';

export type BaseRequest<RequestSchema extends z.ZodSchema> = z.infer<RequestSchema>;
