export interface PaymentMethods {
    paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
    id: string
    name: string
    is_requires_due_date: boolean
    additional_info: null
}