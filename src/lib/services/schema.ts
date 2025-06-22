import { Schema } from "effect";

export class ShareChatRequest extends Schema.Class<ShareChatRequest>("ShareChatRequest")({
    youtubeId: Schema.String,
    userVideoId: Schema.Number,
}) { }

export class ShareChatResponse extends Schema.Class<ShareChatResponse>("ShareChatResponse")({
    url: Schema.String,
}) { }