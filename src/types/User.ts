interface Group {
    id: string
    name: string
}

interface User {
    id: string
    email: string
    is_admin: boolean
    date_joined: Date
    group: Group
}


interface Users {
    users: User[]
}

interface Invite {
    email: string
    is_admin: boolean
    group?: number
}

interface Create {
    email: string
    password: string
}

interface Groups {
    groups: Group[]
}