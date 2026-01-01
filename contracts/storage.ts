export const STORAGE_ADDRESS =
  "0xCONTRACTADDRESSONSEPOLIA" as const;

export const STORAGE_ABI = [
  {
    type: "function",
    name: "store",
    stateMutability: "nonpayable",
    inputs: [{ name: "num", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "retrieve",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
