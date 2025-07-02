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

        const externalClient = baseClient.pipe(
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

        const externalGet = <ARes, IRes, RRes>({
            url,
            res,
        }: {
            url: string;
            res: Schema.Schema<ARes, IRes, RRes>;
        }) =>
            HttpClientRequest.get(url).pipe(
                externalClient.execute,
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
            searchVideos: Effect.fn("searchVideos")((query: string) =>
                externalGet({
                    url: `https://api.ahmadrosid.com/youtube/search?q=${encodeURIComponent(
                        query
                    )}`,
                    res: VideoSearchResponse,
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
    return yield* api.searchVideos(query);
});
