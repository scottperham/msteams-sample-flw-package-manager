import { parseBool } from "adaptivecards"
import { CardAction } from "botbuilder"

export type IdentifiableEntity = {
    id: number
}

export type User = IdentifiableEntity & {
    jobTitle: string
    name: string
    profileImage: string
    alias: string
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

export type AccountManagerMessage = {
    packageId: string
    message: string
}

export const convertInvokeActionDataToPackageData = (data: any) : AccountManagerMessage => {
    return {
        packageId: data.packageId,
        message: data.message
    }
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