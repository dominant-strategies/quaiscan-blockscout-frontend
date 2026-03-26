declare module 'react-identicons'

declare module '@ethereum-sourcify/bytecode-utils' {
  export enum AuxdataStyle {
    SOLIDITY = 'SOLIDITY',
  }

  export function splitAuxdata(
    bytecode: string,
    style: AuxdataStyle,
  ): [string | undefined, string | undefined];
}
