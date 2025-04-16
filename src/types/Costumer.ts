interface Costumer {
    company_name: string
    brand_name: string
    cnpj: string
    phone_number: string
    email: string
    state_tax_registration: string
    billing_address: Address
    contact: Contact
}

export interface Address {
    cep: string
    street_name: string
    district: string
    number: string
    city: string
    state: string
    observation: string
}

interface Contact {
    name: string
    date_of_birth: string
    contact_phone: string
    contact_email: string
}

interface Costumers {
    costumers: Costumer[]
}

interface updateCostumer {
    id: string
    company_name?: string
    brand_name?: string
    cnpj?: string
    phone_number?: string
    email?: string
    state_tax_registration?: string
    contact?: Contact
}