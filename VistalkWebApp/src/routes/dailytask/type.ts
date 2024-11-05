export type DailyTaskDto ={
    taskID: number;
    typeName: string;
    rewardCoins: number;
    taskDate: string;
    taskTypeId: number;
    quantity: number;
    powerUpId: number| null;
}

export type DailyTaskType = {
    id: number;
    typeName: string;
    description: string;
}

export type PowerUp = 
{
    itemID:number,
    name:string,
    descriptiong:string,
    isImplemented:boolean;
}