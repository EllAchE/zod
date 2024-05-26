import type { ZodParsedType } from "../index.ts";
import { getErrorMap } from "../errors.ts";
import defaultErrorMap from "../locales/en.ts";
import type { IssueData, ZodErrorMap, ZodIssue } from "../ZodError.ts";

export const makeIssue = (params: {
  data: any;
  path: (string | number)[];
  errorMaps: ZodErrorMap[];
  issueData: IssueData;
}): ZodIssue => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...(issueData.path || [])];
  const fullIssue = {
    ...issueData,
    path: fullPath,
  };

  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message,
    };
  }

  let errorMessage = "";
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse() as ZodErrorMap[];
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }

  return {
    ...issueData,
    path: fullPath,
    message: errorMessage,
  };
};

export type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
  async: boolean;
};

export type ParsePathComponent = string | number;
export type ParsePath = ParsePathComponent[];
export const EMPTY_PATH: ParsePath = [];

export interface ParseContext {
  readonly common: {
    readonly issues: ZodIssue[];
    readonly contextualErrorMap?: ZodErrorMap;
    readonly async: boolean;
  };
  readonly path: ParsePath;
  readonly schemaErrorMap?: ZodErrorMap;
  readonly parent: ParseContext | null;
  readonly data: any;
  readonly parsedType: ZodParsedType;
}

export type ParseInput = {
  data: any;
  path: (string | number)[];
  parent: ParseContext;
};

export function addIssueToContext(
  ctx: ParseContext,
  issueData: IssueData
): void {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData: issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap, // contextual error map is first priority
      ctx.schemaErrorMap, // then schema-bound map if available
      overrideMap, // then global override map
      overrideMap === defaultErrorMap ? undefined : defaultErrorMap, // then global default map
    ].filter((x) => !!x) as ZodErrorMap[],
  });
  ctx.common.issues.push(issue);
}

export type ObjectPair = {
  key: SyncParseReturnType<any>;
  value: SyncParseReturnType<any>;
  alwaysSet?: boolean;
};
export class ParseStatus {
  value: "aborted" | "dirty" | "valid" = "valid";
  dirty() {
    if (this.value === "valid") this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted") this.value = "aborted";
  }

  static mergeArray(
    status: ParseStatus,
    results: SyncParseReturnType<any>[]
  ): SyncParseReturnType {
    const arrayValue: any[] = [];
    for (const s of results) {
      if (s.status === "aborted") status.abort();
      if (s.status === "dirty") status.dirty();
      arrayValue.push(s.value);
    }

    return { status: status.value, value: arrayValue };
  }

  static async mergeObjectAsync(
    status: ParseStatus,
    pairs: {
      key: ParseReturnType<any>;
      value: ParseReturnType<any>;
      alwaysSet?: boolean;
    }[]
  ): Promise<SyncParseReturnType<any>> {
    const syncPairs: ObjectPair[] = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value,
        alwaysSet: pair.alwaysSet,
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }

  static mergeObjectSync(
    status: ParseStatus,
    pairs: ObjectPair[]
  ): SyncParseReturnType {
    const finalObject: any = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted") status.abort();
      if (value.status === "aborted") status.abort();
      if (key.status === "dirty") status.dirty();
      if (value.status === "dirty") status.dirty();

      if (
        key.value !== "__proto__" &&
        (typeof value.value !== "undefined" || pair.alwaysSet)
      ) {
        finalObject[key.value] = value.value;
      }
    }

    return { status: status.value, value: finalObject };
  }
}
export interface ParseResult {
  status: "aborted" | "dirty" | "valid";
  data: any;
}

export type INVALID = { status: "aborted", value: unknown };
// TODO: could differentiate mismatched types from invalid types (like length?)
export const INVALID = (value: unknown): INVALID => ({
  status: "aborted",
  value
});

export type DIRTY<T> = { status: "dirty"; value: T };
export const DIRTY = <T>(value: T): DIRTY<T> => ({ status: "dirty", value });

export type OK<T> = { status: "valid"; value: T };
export const OK = <T>(value: T): OK<T> => ({ status: "valid", value });

export type WARN = { status: "warn"; value: unknown };
export const WARN = (value: unknown): WARN => ({ status: "warn", value });

// success flag is passed down from the top-level parse function to say if the entire parse was successful
export type SyncParseReturnType<T = any, SuccessFlag extends (boolean | undefined) = undefined> =  SuccessFlag extends boolean ? (SuccessFlag extends true ? OK<T> : DIRTY<T> | WARN | INVALID) : OK<T> | DIRTY<T> | WARN | INVALID;
export type StrictSyncParseReturnType<T = any> = OK<T>;
export type AsyncParseReturnType<T, SuccessFlag extends (boolean | undefined) = undefined> = Promise<SyncParseReturnType<T, SuccessFlag> >;
export type StrictAsyncParseReturnType<T> = Promise<StrictSyncParseReturnType<T>>;
export type ParseReturnType<T, SuccessFlag extends (boolean | undefined) = undefined> =
  | SyncParseReturnType<T, SuccessFlag>
  | AsyncParseReturnType<T, SuccessFlag>
export type StrictParseReturnType<T> =
  | StrictSyncParseReturnType<T>
  | StrictAsyncParseReturnType<T>;

export const isWarn = <T>(x: ParseReturnType<T>): x is WARN => (x as any).status === "warn"
export const isAborted = (x: ParseReturnType<any>): x is INVALID =>
  (x as any).status === "aborted";
export const isDirty = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> =>
  (x as any).status === "dirty";
export const isValid = <T>(x: ParseReturnType<T>): x is OK<T> =>
  (x as any).status === "valid";
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> =>
  typeof Promise !== "undefined" && x instanceof Promise;