import { post, get, put } from "$lib/api/baseRepo";
import type { QuestionMatchingTypeDto } from "$lib/api/componentType";
import type { CallResultDto } from "../../types/types";
import type { Language } from "../type";
import type { Content, MatchingType, MultipleChoice, QuestionDto, QuestionType, Section, Unit } from "./type";

const baseUrl = import.meta.env.VITE_BASE_API;

export async function saveSection(section:Section) {
	return await post<CallResultDto<object>>(`/saveSection`, {}, section);
}

export async function getSections(languageID:number) {
	let result =  await get<CallResultDto<Section[]>>(`/getSections`, {languageID});
    return result;
}

export async function saveUnit(unit:Unit) {
	return await post<CallResultDto<object>>(`/saveUnit`, {}, unit);
}

export async function getUnits(sectionID:number, pageNo:number, searchString :string | null) {
	let result =  await get<CallResultDto<Unit[]>>(`/getUnits`, {sectionID, pageNo, searchString});
    return result;
}

export async function getQuestionTypes() {
	let result =  await get<CallResultDto<QuestionType[]>>(`/getQuestionTypes`);
    return result;
}

export async function getChoices(languageID:number) {
	let result =  await get<CallResultDto<Content[]>>(`/getChoices`,{languageID});
    return result;
}

export async function getQuesions(unitId:number, pageNo:number, searchString :string | null) {
	let result =  await get<CallResultDto<QuestionDto[]>>(`/getQuestions`, {unitId, pageNo, searchString});
    return result;
}

export async function getMultipleChoice(questionID:number) {
	let result =  await get<CallResultDto<MultipleChoice>>(`/getMultipleChoice`,{questionID});
    return result;
}
export async function getMatchingType(questionMatchingTypeID:number) {
	let result =  await get<CallResultDto<QuestionMatchingTypeDto>>(`/getMatchingType`,{questionMatchingTypeID});
    return result;
}

export async function sectionInactive(sectionID:number) {
	return await put<CallResultDto<object>>(`/sectionInactive`, {sectionID});
}

export async function unitInactive(unitID:number) {
	return await put<CallResultDto<object>>(`/unitInactive`, {unitID});
}

export async function getQuestionFile(fileName: string): Promise<Blob | null> {
    try {
        const response = await fetch(`${baseUrl}/getQuestionFiles?fileName=${fileName}`, {
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

export async function questionInactive(questionID:number, unitID:number) {
	return await put<CallResultDto<object>>(`/questionInactive`, {questionID, unitID});
}