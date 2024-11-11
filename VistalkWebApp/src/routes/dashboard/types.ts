export type LeaderBoardDto = 
{
    id:number;
    name: string;
    totalScore: number;
    imagePath: string;
}

export type StatusDto = 
{
    active:number;
    inactive: number;
}

export type UserLanguage = 
{
    languageName:string;
    userCount: number;
}

export type SubscriptionDto = 
{
    type:string;
    month: number;
    subscriptionCount:number;
}

export type RatingDto = 
{
    type:string;
    month: number;
    ratingCount:number;
}

export type SalesDto = 
{
    transactionID:number;
    userPlayerID: number;
    coinBagID:number | null;
    subscriptionID : number | null;
    transactionDate: string;
    amountPaid: number;
    name:string;
    itemName:string;
    itemType:string;
}