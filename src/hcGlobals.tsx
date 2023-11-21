export enum SupportedWebsite {
    RssBlue = "rssblue.com",
    Anchor = "podcasters.spotify.com",
    BuzzSprout = "buzzsprout.com",
    Blubrry = "publish.blubrry.com",
}

export enum SupportedAction {
    InsertText = "insertText",
    UploadFile = "uploadFile",
    InsertChapters = "insertChapters",
    BlUploadFile = "blUploadFile",
    None = 'none'
}

export const getSupportedActionForWebsite = (website: SupportedWebsite): SupportedAction => {
    switch (website) {
        case SupportedWebsite.Anchor:
            return SupportedAction.InsertText;
        case SupportedWebsite.RssBlue:
            return SupportedAction.UploadFile
        case SupportedWebsite.BuzzSprout:
            return SupportedAction.InsertChapters
        case SupportedWebsite.Blubrry:
            return SupportedAction.BlUploadFile
        default:
            throw new Error(`Website ${website} not supported`);
    }
} 