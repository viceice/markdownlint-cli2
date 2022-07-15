// @ts-check

"use strict";

const path = require("path");
const { promisify } = require("util");
const test = require("ava").default;
const FsMock = require("./fs-mock");

const mockPath = "/mock";
const thisFile = path.basename(__filename);
const testFile = path.join(mockPath, thisFile);

test("fsMock.stat", async (t) => {
  t.plan(2);
  const fs = new FsMock(__dirname);
  const fsStat = promisify(fs.stat);
  // @ts-ignore
  const stat = await fsStat(testFile);
  t.truthy(stat);
  t.true(stat.size > 0);
});

test("fsMock.lstat", async (t) => {
  t.plan(3);
  const fs = new FsMock(__dirname);
  const fsLstat = promisify(fs.lstat);
  // @ts-ignore
  const stat = await fsLstat(testFile);
  t.truthy(stat);
  t.true(stat.size > 0);
  t.false(stat.isSymbolicLink());
});

test("fsMock.lstat symbolic links", async (t) => {
  t.plan(3);
  const fs = new FsMock(__dirname, true);
  const fsLstat = promisify(fs.lstat);
  // @ts-ignore
  const stat = await fsLstat(testFile);
  t.truthy(stat);
  t.true(stat.size > 0);
  t.true(stat.isSymbolicLink());
});

test("fsMock.readdir", async (t) => {
  t.plan(3);
  const fs = new FsMock(__dirname);
  const fsReaddir = promisify(fs.readdir);
  // @ts-ignore
  const files = await fsReaddir(mockPath);
  t.true(Array.isArray(files));
  t.true(files.length > 0);
  t.true(files.includes(thisFile));
});

test("fsMock.*", async (t) => {
  t.plan(1);
  const fs = new FsMock(__dirname);
  const fsAccess = promisify(fs.access);
  // @ts-ignore
  await fsAccess(testFile);
  const fsLstat = promisify(fs.lstat);
  // @ts-ignore
  await fsLstat(testFile);
  const fsStat = promisify(fs.stat);
  // @ts-ignore
  await fsStat(testFile);
  const fsReadFile = promisify(fs.readFile);
  // @ts-ignore
  const content = await fsReadFile(testFile, "utf8");
  t.true(content.length > 0);
});

test("fsMock.promises.*", async (t) => {
  t.plan(2);
  const fs = new FsMock(__dirname);
  const tempName = "fs-mock.tmp";
  const tempFile = path.join(mockPath, tempName);
  t.throwsAsync(() => fs.promises.access(tempFile));
  await fs.promises.writeFile(tempFile, tempFile, "utf8");
  await fs.promises.access(tempFile);
  await fs.promises.stat(tempFile);
  t.is(await fs.promises.readFile(tempFile, "utf8"), tempFile);
  await require("fs").promises.unlink(path.join(__dirname, tempName));
});
