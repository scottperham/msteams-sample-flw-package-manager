import { parseBool } from "adaptivecards"
import { CardAction } from "botbuilder"

export type IdentifiableEntity = {
    id: number
}

export type User = IdentifiableEntity & {
    jobTitle: string
    name: string
    profileImage: string
    upn: string
}

export type Package = IdentifiableEntity & {
    packageId: string
    accountManagerId: number
    accountManager: User | undefined
    customer: string
    customerId: string
    contains: string
    priority: string
    deliveryAddress: string
    status: string
    coshh: boolean
}

/* Extra adaptive card types! */

export interface ListCard {
    title: string
    items: CardListItem[]
    buttons: CardAction[]
}

export interface CardListItem {
    id?: string
    icon: string
    type: string
    title: string
    subtitle: string
    tap: CardAction
}