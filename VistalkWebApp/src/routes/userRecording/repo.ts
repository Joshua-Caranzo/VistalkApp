import { get, put } from "$lib/api/baseRepo";
import type { CallResultDto } from "../../types/types";
import type { FileData, Language } from "./types";

const baseUrl = import.meta.env.VITE_BASE_API;

export async function getFileContents(pageNo:number, searchString:string | null, languageId:number) {
	let result =  await get<CallResultDto<FileData[]>>(`/getRecordingContents`, {pageNo, searchString, languageId});
    return result;
}

export async function getLanguages() {
    let result = await get<CallResultDto<Language[]>>(`/getLanguages`);
    return result;
}

export async function getRecordingByFileName(fileName: string, languageId:number, contentId:number, contentName:string): Promise<Blob | null> {
    try {
        const response = await fetch(`${baseUrl}/getRecordingByFileName?fileName=${fileName}&languageId=${languageId}&contentId=${contentId}&contentName=${contentName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
        if (response.ok) {
            return await response.blob();
        } else {
            console.error(`Failed to fetch file: ${response.statusText}`);
            return null;    
        }
    } catch (error) {
        console.error(`Failed to fetch file:`, error);
        return null;
    }
}

export async function rejectFile(fileId:number) {
    return await put<CallResultDto<object>>(`/rejectRecording`, {fileId});
}

export async function acceptFile(fileId:number) {
    return await put<CallResultDto<object>>(`/acceptRecording`, {fileId});
}