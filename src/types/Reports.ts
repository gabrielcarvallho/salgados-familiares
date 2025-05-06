import {z} from 'zod'

const reportSchemaResponse = z.object({
    total_sales: z.coerce.number(),
    total_value: z.coerce.number(),
    total_customers: z.coerce.number(),
    active_users: z.coerce.number(),
})

export type ReportResponse = z.infer<typeof reportSchemaResponse>