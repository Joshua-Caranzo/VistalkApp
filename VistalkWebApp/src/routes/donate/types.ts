export type ContentType = 
{
    contentTypeID:number,
    typeName:string
}

export type Content = 
{
    contentID:number;
    contentText:string;
    englishTranslation:string;
    audioPath:string;
    languageID:number;
    contentTypeId:number;
    isInDictionary: boolean;
    audio:HTMLAudioElement | null;
    file:File | null;
    isPlaying:boolean
}

export type Language = {
    languageID: number;
    name: string;
    place: string;
    native_name: string;
    description: string;
};
