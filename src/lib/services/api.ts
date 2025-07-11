import {
    FetchHttpClient,
    HttpClient,
    HttpClientRequest,
    HttpClientResponse,
} from "@effect/platform";
import { Effect, Schedule, Schema } from "effect";
import {
    ShareChatRequest,
    ShareChatResponse,
    ClearMessagesRequest,
    ClearMessagesResponse,
    VideoSearchResponse,
    VideoCommentsResponse,
} from "@/lib/services/schema";

export class Api extends Effect.Service<Api>()("Api", {
    dependencies: [FetchHttpClient.layer],
    accessors: true,
    effect: Effect.gen(function* () {
        const baseClient = yield* HttpClient.HttpClient;

        const client = baseClient.pipe(
            HttpClient.mapRequest(HttpClientRequest.prependUrl(`/api`)),
            HttpClient.mapRequest(HttpClientRequest.acceptJson),
            HttpClient.retryTransient(Schedule.exponential("100 millis"))
        );

        const post =
            <AReq, IReq, RReq, ARes, IRes, RRes>({
                url,
                req,
                res,
            }: {
                url: string;
                req: Schema.Schema<AReq, IReq, RReq>;
                res: Schema.Schema<ARes, IRes, RRes>;
            }) =>
                (body: AReq) =>
                    HttpClientRequest.post(url).pipe(
                        HttpClientRequest.schemaBodyJson(req)(body),
                        Effect.flatMap(client.execute),
                        Effect.flatMap(HttpClientResponse.schemaBodyJson(res))
                    );

        return {
            createShareVideo: Effect.fn("createShareVideo")(post({
                url: "/share",
                req: ShareChatRequest,
                res: ShareChatResponse,
            })),
            clearMessages: Effect.fn("clearMessages")(post({
                url: "/clear-messages",
                req: ClearMessagesRequest,
                res: ClearMessagesResponse,
            })),
            searchVideos: Effect.fn("searchVideos")(post({
                url: "/youtube/search",
                req: Schema.Struct({ query: Schema.String }),
                res: VideoSearchResponse,
            })),
            generateThreads: Effect.fn("generateThreads")(post({
                url: "/thread-generator",
                req: Schema.Struct({ 
                    youtubeUrl: Schema.String,
                    language: Schema.optional(Schema.String)
                }),
                res: Schema.Struct({
                    success: Schema.Boolean,
                    data: Schema.Struct({
                        outline: Schema.Struct({
                            hook: Schema.String,
                            painPoint: Schema.String,
                            promise: Schema.String,
                            keyPoints: Schema.Array(Schema.String)
                        }),
                        threads: Schema.Array(Schema.Struct({
                            tweetNumber: Schema.Number,
                            content: Schema.String,
                            isOpening: Schema.Boolean
                        }))
                    }),
                    videoDetails: Schema.optional(Schema.Struct({
                        title: Schema.String,
                        channelTitle: Schema.String,
                        thumbnailUrl: Schema.NullOr(Schema.String),
                        publishedAt: Schema.String
                    }))
                }),
            })),
            getComments: Effect.fn("getComments")(post({
                url: "/youtube/comments",
                req: Schema.Struct({ 
                    videoId: Schema.optional(Schema.String),
                    videoUrl: Schema.optional(Schema.String)
                }),
                res: VideoCommentsResponse,
            })),
        };
    }),
}) { }

export const createShareVideo = (
    input: ShareChatRequest
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.createShareVideo(input);
});

export const clearChatMessages = (
    input: ClearMessagesRequest
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.clearMessages(input);
});

export const searchVideos = (
    query: string
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.searchVideos({ query });
});

export const generateThreads = (
    youtubeUrl: string,
    language?: string
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.generateThreads({ youtubeUrl, language });
});

export const getComments = (
    videoId?: string,
    videoUrl?: string
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.getComments({ videoId, videoUrl });
});
