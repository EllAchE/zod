// @ts-ignore TS6133
import { test } from "@jest/globals";

import { Mocker } from "./Mocker";

test("mocker", () => {
  const mocker = new Mocker();
  mocker.sString;
  mocker.sNumber;
  mocker.boolean;
  mocker.null;
  mocker.undefined;
  mocker.sStringOptional;
  mocker.sStringNullable;
  mocker.sNumberOptional;
  mocker.sNumberNullable;
  mocker.booleanOptional;
  mocker.booleanNullable;
});
