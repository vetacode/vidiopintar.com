import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Effect, flow } from "effect";
import { ShareChatRequest, ShareChatResponse } from "@/lib/services/schema";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export class Api extends Effect.Service<Api>()("Api", {
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
        const baseClient = yield* HttpClient.HttpClient;
        const client = baseClient.pipe(
            HttpClient.mapRequest(
                flow(
                    HttpClientRequest.prependUrl(`${baseUrl}/api`),
                    HttpClientRequest.acceptJson
                )
            )
        );

        return {
            createShareVideo: (body: ShareChatRequest) =>
                HttpClientRequest.schemaBodyJson(ShareChatRequest)
                (HttpClientRequest.post("/share"), body).pipe(
                    Effect.flatMap(client.execute),
                    Effect.flatMap(HttpClientResponse.schemaBodyJson(ShareChatResponse)),
                    Effect.scoped
                )
        };
    }),
}) { }


export const createShareVideo = (
    input: ShareChatRequest
) => Effect.gen(function* () {
    const api = yield* Api;
    return yield* api.createShareVideo(input);
});
