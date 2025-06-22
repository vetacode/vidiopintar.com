import * as Http from "@effect/platform/HttpClient";

import { Effect, Schema } from "effect"

const SharedVideo = Schema.Struct({
    url: Schema.String
})
const ShareVideoRequest = Schema.Struct({
    youtubeId: Schema.String,
    userVideoId: Schema.Number,
  })
  