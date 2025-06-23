import { Schema } from "effect";

export class ShareChatRequest extends Schema.Class<ShareChatRequest>("ShareChatRequest")({
    youtubeId: Schema.String,
    userVideoId: Schema.Number,
}) { }

export class ShareChatResponse extends Schema.Class<ShareChatResponse>("ShareChatResponse")({
    url: Schema.String,
}) { }

export class ClearMessagesRequest extends Schema.Class<ClearMessagesRequest>("ClearMessagesRequest")({
    userVideoId: Schema.Number,
}) { }

export class ClearMessagesResponse extends Schema.Class<ClearMessagesResponse>("ClearMessagesResponse")({
    success: Schema.Boolean,
}) { }