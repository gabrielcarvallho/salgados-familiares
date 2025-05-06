import { z } from 'zod'


export const productionScheduleSchemaResponse = z.object({
    product_name: z.string(),
    total_packages: z.coerce.number(),
    total_batches: z.coerce.number(),
})

export type ProductionScheduleResponse = z.infer<typeof productionScheduleSchemaResponse>