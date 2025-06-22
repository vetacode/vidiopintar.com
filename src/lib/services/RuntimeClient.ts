import { Layer, ManagedRuntime } from "effect";
import { Api } from "@/lib/services/api";

const MainLayer = Layer.mergeAll(Api.Default);

export const RuntimeClient = ManagedRuntime.make(MainLayer);