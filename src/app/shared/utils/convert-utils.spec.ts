import {prettyPrintFileSize} from "./convert-utils";
import {expect} from "@angular/flex-layout/_private-utils/testing";

describe("ConvertUtils", () => {
  it("Should return empty string.", () => {
    expect(prettyPrintFileSize(NaN)).toEqual("")
  })
  it("Should return filesize in bytes.", () => {
    expect(prettyPrintFileSize(0)).toEqual("0 B")
    expect(prettyPrintFileSize(2 ** 10 - 1)).toEqual("1023 B")
  })
  it("Should return filesize in kibibytes.", () => {
    expect(prettyPrintFileSize(2 ** 10)).toEqual("1.0 KiB")
    expect(prettyPrintFileSize(2 ** 20 - 1)).toEqual("1024.0 KiB")
  })
  it("Should return filesize in mebibytes.", () => {
    expect(prettyPrintFileSize(2 ** 20)).toEqual("1.0 MiB")
    expect(prettyPrintFileSize(2 ** 30 - 1)).toEqual("1024.0 MiB")
  })
  it("Should return filesize in gibibytes.", () => {
    expect(prettyPrintFileSize(2 ** 30)).toEqual("1.0 GiB")
    expect(prettyPrintFileSize(2 ** 40 - 1)).toEqual("1024.0 GiB")
  })
  it("Should return filesize in tebibytes.", () => {
    expect(prettyPrintFileSize(2 ** 40)).toEqual("1.0 TiB")
  })
})
