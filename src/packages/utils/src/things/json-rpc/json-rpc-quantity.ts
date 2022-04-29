import { bufferToBigInt } from "../../utils/buffer-to-bigint";
import { BaseJsonRpcType } from "./json-rpc-base-types";
const BUFFER_EMPTY = Buffer.alloc(0);

export class Quantity extends BaseJsonRpcType {
  _nullable: boolean = false;

  public static from(value: number | bigint | string | Buffer, nullable = false) {
    if (value instanceof Quantity) return value;
    return new Quantity(value, nullable);
  }

  constructor(value: number | bigint | string | Buffer, nullable?: boolean) {
    super(value);
    this._nullable = nullable;
  }

  public toString(): string | null {
    if (this.value == null) {
      return this._nullable? null : "0x";
    }

    let val = this.value.toString("hex").replace(/^0*/, "");

    if (val === "") {
      // RPC Quantities must represent `0` as `0x0`
      return this._nullable ? null : "0x0";
    }
    return `0x${val}`;
  }
  public toBuffer(): Buffer {
    if (this.value == null) {
      return BUFFER_EMPTY;
    }

    let firstNonZeroByte = 0;
    for (firstNonZeroByte = 0; firstNonZeroByte < this.value.length; firstNonZeroByte++) {
      if (this.value[firstNonZeroByte] !== 0) break;
    }
    if (firstNonZeroByte > 0) {
      return this.value.slice(firstNonZeroByte);
    } else {
      return this.value;
    }
  }

  public toBigInt(): bigint | null {
    if (this.value == null || this.value.length === 0) {
      return this._nullable ? null : 0n;
    }
    return bufferToBigInt(this.value);
  }

  public toNumber() {
    if (this.value == null || this.value.length === 0) {
      return this._nullable ? null : 0;
    }

    const length = this.value.length;

    if(length === 0) return 0; // todo: should this be nullable?
    if(length === 1) return this.value[0];
    if(length <= 6) return this.value.readUIntBE(0, length);
    return Number(this.toBigInt());
  }

  public isNull() {
    return super.isNull() || this.value.length === 0;
  }

  valueOf(): bigint {
    const value = this.value;
    if (value === null) {
      return value as null;
    } else if (value === undefined) {
      return value as undefined;
    } else {
      return this.toBigInt();
    }
  }
}

export default Quantity;
