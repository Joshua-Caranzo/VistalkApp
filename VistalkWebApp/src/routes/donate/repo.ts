import { get, postForm } from "$lib/api/baseRepo";
import type { CallResultDto } from "../../types/types";
import type { Content, Language } from "./types";

export async function getLanguages() {
    let result = await get<CallResultDto<Language[]>>(`/getLanguages`);
    return result;
}

export async function getContents(languageID: number, contentTypeID: number | null, searchString: string | null, pageNo: number) {
    return await get<CallResultDto<Content[]>>(`/getContents`, { languageID, contentTypeID, searchString, pageNo });
}

export async function getContentsAll(languageID: number) {
    return await get<CallResultDto<Content[]>>(`/getContentsAll`, { languageID });
}

export async function saveAudio(contentId: number, contentName: string, audioBlob: Blob) {
    const formData = new FormData();

    formData.append('contentId', contentId.toString());
    formData.append('contentName', contentName);
    if (audioBlob) {
        const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
        formData.append('audioFile', file);
    }
    return await postForm<CallResultDto<object>>(`/saveAudio`, formData);
}
