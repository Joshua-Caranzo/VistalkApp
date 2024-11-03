import { get, put } from "$lib/api/baseRepo";
import type { CallResultDto } from "../../types/types";
import type { LeaderBoardDto, SalesDto, StatusDto, SubscriptionDto, UserLanguage } from "./types";

export async function getLeaderBoards(granularity:string){
    return await get<CallResultDto<LeaderBoardDto[]>>('getLeaderBoard', {granularity});
}

export async function getStatusVista(){
    return await get<CallResultDto<StatusDto>>('getStatusVista');
}

export async function getUserLanguage(){
    return await get<CallResultDto<UserLanguage[]>>('getLanguageUsers');
}

export async function getSubscriptionData(){
    return await get<CallResultDto<SubscriptionDto[]>>('getSubscriptionData');
}

export async function salesReport(granular:string){
    return await get<CallResultDto<number>>('salesReport', {granular});
}

export async function salesReportCoinBags(granular:string){
    return await get<CallResultDto<number>>('salesReportCoinBags', {granular});
}

export async function salesReportSusbcription(granular:string){
    return await get<CallResultDto<number>>('salesSubscriptions', {granular});
}

export async function getTotalSales(granular:string, item:string){
    return await get<CallResultDto<SalesDto[]>>('getTotalSales', {granular, item});
}
