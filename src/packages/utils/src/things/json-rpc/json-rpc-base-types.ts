import { bigIntToBuffer, uintToBuffer, BUFFER_EMPTY } from "../../utils";

const inspect = Symbol.for("nodejs.util.inspect.custom");

export class BaseJsonRpcType<
  T extends number | bigint | string | Buffer =
    | number
    | bigint
    | string
    | Buffer
> {
  private static _validateRegex = /^0x[0-9a-fA-F]*$/;
  public [Symbol.toStringTag]: string;

  protected value: Buffer | null;
  // used to make console.log debugging a little easier
  private [inspect](_depth: number, _options: any): string {
    return `[${this.constructor.name}] ${this.toString()}`;
  }

  constructor(value: T) {
    this.init(value);
  }

  init(value) {
    if (Buffer.isBuffer(value) || value == null) {
      this.value = value;
    } else {
      const type = typeof value;
      this[Symbol.toStringTag] = type;
      switch (type) {
        case "number":
          if (value % 1) {
            throw new Error(`Cannot wrap a decimal as a json-rpc type`);
          }
          if (!isFinite(value)) {
            throw new Error(`Cannot wrap a ${value} as a json-rpc type`);
          }
          if (value === 0) {
            this.value = BUFFER_EMPTY;
          } else {
            this.value = uintToBuffer(value as number);
          }
          break;
        case "bigint":
          if (value % 1n) {
            throw new Error(`Cannot wrap a decimal as a json-rpc type`);
          }
          this.value = value === 0n ? BUFFER_EMPTY : bigIntToBuffer(value as bigint);
          break;
        case "string":
          if (!BaseJsonRpcType._validateRegex.test(value)) {
            throw new Error(`Cannot convert string value "${value}" into type ${this.constructor.name}; strings must be hex-encoded and prefixed with "0x".`);
          }
          let hexValue = (<string>value).slice(2);
          if (hexValue.length & 1) {
            hexValue = "0" + hexValue;
          }
          this.value = Buffer.from(hexValue, "hex");
          break;
        default:
          throw new Error(`Cannot wrap a "${type}" as a json-rpc type`);
      }
    }
  }

  toString(): string | null {
    if (this.value == null) {
      return <null>this.value;
    }
    return "0x" + this.value.toString("hex");
  }

  toBuffer(): Buffer {
    return this.value;
  }

  valueOf(): any {
    return this.value;
  }

  toJSON(): string | null {
    return this.toString();
  }

  isNull() {
    return this.value == null;
  }
}

export type JsonRpcType<
  T extends number | bigint | string | Buffer
> = BaseJsonRpcType<T>;
