export type FileData = 
{
    id:number;
    contentId:number;
    filePath:string;
    isAccepted:boolean;
    fileName:string;
    contentText:string;
    isRejected:boolean;
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
