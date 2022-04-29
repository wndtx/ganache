import { BUFFER_EMPTY } from "../../utils";
import { BaseJsonRpcType } from "./json-rpc-base-types";

function validateByteLength(byteLength?: number) {
  if (byteLength !== undefined && (typeof byteLength !== "number" || byteLength < 0 || !isFinite(byteLength))) {
    throw new Error(`byteLength must be a number greater than or equal to 0, provided: ${byteLength}`);
  }
}

function padString(value: string, byteLength: number | undefined) {
  let paddedString;
  const charLength = byteLength * 2

  if (byteLength === undefined || charLength === value.length) {
    return value;
  }

  const padCharCount = (byteLength - value.length / 2) * 2; // (desired byte count - actual byte count) * 2 characters per byte
  if (padCharCount === 0) {
    paddedString = value;
  } else if (padCharCount > 0) {
    paddedString = "0".repeat(padCharCount) + value;
  } else {
    paddedString = value.slice(0, charLength);
  }
  return paddedString;
}

function padBuffer(value: Buffer, byteLength: number | undefined) {
  if (byteLength === undefined || byteLength === value.length) {
    return value;
  }

  //todo: can we allocUnsafe, and fill the zeros only in the padded bytes?
  const returnValue = Buffer.alloc(byteLength);

  const sourceStart = 0;
  const targetStart = value.length > byteLength ? 0 : byteLength - value.length;
  value.copy(returnValue, targetStart, sourceStart, byteLength);

  return returnValue;
}

export class Data extends BaseJsonRpcType {
  constructor(value: string | Buffer, private _byteLength?: number) {
    super(value);
    if (typeof value === "bigint") {
      throw new Error(`Cannot create a ${typeof value} as a Data`);
    }
    if (_byteLength !== undefined) {
      validateByteLength(_byteLength);
    }
  }

  public toString(byteLength?: number): string | null {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    if (this.value == null) {
      return <null>this.value;
    }

    if (length === undefined) {
      return super.toString();
    }

    return "0x" + padString(this.value.toString("hex"), length);
  }

  public toBuffer(byteLength?: number): Buffer {
    validateByteLength(byteLength);

    const length = byteLength ?? this._byteLength;

    if (this.value == null) {
      return BUFFER_EMPTY;
    }

    const buffer = super.toBuffer();

    if (length === undefined) {
      return buffer;
    }

    return padBuffer(buffer, length);
  }

  public static from<T extends string | Buffer = string | Buffer>(
    value: T,
    byteLength?: number
  ) {
    return new Data(value, byteLength);
  }
}
