import { get, post } from "$lib/api/baseRepo";
import { type CallResultDto, type LoggedInUser } from "../types/types";
import type { Language } from "./type";
import CryptoJS from 'crypto-js';


export async function login(email:string, password:string) {
	const hashedPassword = CryptoJS.MD5(password).toString();
	return  await get<CallResultDto<LoggedInUser>>(`/login`, {email, hashedPassword});
}

export async function sendEmailToUs(email:string, message:string) {
	return  await post<CallResultDto<object>>(`/sendEmailToUs`, {email, message});
}