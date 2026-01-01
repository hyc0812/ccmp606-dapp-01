export const COUNTER_ADDRESS =
  "0xedd2011b3feb131f6412de7124c139b5a4b10a42" as const;

export const COUNTER_ABI = [
  {
    type: "function",
    name: "x",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "inc",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "incBy",
    stateMutability: "nonpayable",
    inputs: [{ name: "by", type: "uint256" }],
    outputs: [],
  },
  {
    type: "event",
    name: "Increment",
    inputs: [{ indexed: false, name: "by", type: "uint256" }],
    anonymous: false,
  },
] as const;
