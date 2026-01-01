"use client";

import { useEffect, useMemo } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { formatUnits } from "viem";

const counterAddress = "0x04742e8F34EECd2eCE73952aa246C63048beb2F5" as const;

const counterAbi = [
  {
    inputs: [],
    name: "count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "inc", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "dec", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

export default function Home() {
 
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const connect = useConnect();
  const disconnect = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;
  const networkName =
    chainId === sepolia.id ? "Sepolia" : chainId ? `Chain ${chainId}` : "-";

  // ------- Balance -------
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    chainId: chainId ?? sepolia.id,
    query: { enabled: !!address },
  });

  // ------- Read: count -------
  const {
    data: count,
    isFetching: countFetching,
    refetch: refetchCount,
    error: readError,
  } = useReadContract({
    address: counterAddress,
    abi: counterAbi,
    functionName: "count",
    chainId: sepolia.id,
    query: { enabled: isConnected && !isWrongNetwork },
  });

  const countBigInt = useMemo(() => (typeof count === "bigint" ? count : 0n), [count]);

  // ------- Write: inc/dec -------
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
    query: { enabled: !!txHash },
  });

 
  useEffect(() => {
    if (isTxSuccess) refetchCount();
  }, [isTxSuccess, refetchCount]);

  const canRead = isConnected && !isWrongNetwork;
  const canWrite = isConnected && !isWrongNetwork && !isWritePending && !isTxConfirming;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 820 }}>
      <h1>wagmi + Remix CCMP606 Dapp (Sepolia)</h1>

      <p>Status: {connect.status}</p>

      {!isConnected ? (
        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => connect.connect({ connector: injected() })}
            style={{
              width: "fit-content",
              justifySelf: "start",
              alignSelf: "start",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#eaeaea",
              cursor: "pointer",
              fontWeight: 600,
            }}
            >
            Connect Wallet (MetaMask)
          </button>

          {connect.error && <p style={{ color: "crimson" }}>{connect.error.message}</p>}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <p>
              <b>Connected</b>
            </p>
            <p>Network: {networkName}</p>
            <p>chainId(debug): {chainId}</p>

            <p>Address: {address}</p>

            <p>
              Balance:{" "}
              {balanceLoading
                ? "Loading..."
                : balance
                ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`
                : "-"}
            </p>

            <button onClick={() => disconnect.disconnect()}
            style={{
              width: "fit-content",
              justifySelf: "start",
              alignSelf: "start",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#eaeaea",
              cursor: "pointer",
              fontWeight: 600,
            }}
              >Disconnect</button>
          </div>

          <hr />

          <div style={{ display: "grid", gap: 10 }}>
            <h2>Counter Contract</h2>
            <p>Contract: {counterAddress}</p>

            {isWrongNetwork && (
              <div style={{ color: "crimson", display: "grid", gap: 8 }}>
                <div>You are not on Sepolia。</div>
                <button
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  disabled={isSwitching}
                >
                  {isSwitching ? "Switching..." : "Switch to Sepolia"}
                </button>
              </div>
            )}

            {/* Read */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => refetchCount()} disabled={!canRead}>
                Read
              </button>

              <span>
                Count:{" "}
                {countFetching ? "Loading..." : countBigInt.toString()}
              </span>
            </div>

            {/* Write */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  writeContract({
                    address: counterAddress,
                    abi: counterAbi,
                    functionName: "inc",
                  })
                }
                disabled={!canWrite}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid #333",
                  background: "#f5f5f5",
                  cursor: canWrite ? "pointer" : "not-allowed",
                  fontWeight: 500,
                }}
              >
                Inc
              </button>

              <button
                onClick={() =>
                  writeContract({
                    address: counterAddress,
                    abi: counterAbi,
                    functionName: "dec",
                  })
                }
                disabled={!canWrite || countBigInt === 0n}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid #333",
                  background: countBigInt === 0n ? "#eee" : "#f5f5f5",
                  cursor:
                    !canWrite || countBigInt === 0n ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
                title={countBigInt === 0n ? "when count=0  dec will revert" : ""}
              >
                Dec
              </button>
            </div>

            {/* Tx status */}
            <div style={{ fontSize: 14 }}>
              {isWritePending && <p>Wait for the confirmation from MetaMask…</p>}
              {isTxConfirming && <p>Transaction sent. Waiting for confirmation from blockchain…</p>}
              {txHash && (
                <p>
                  Tx hash: <code>{txHash}</code>
                </p>
              )}
              {isTxSuccess && <p style={{ color: "green" }}> Transaction confirmed and count refreshed</p>}
            </div>

            {/* Errors */}
            {(readError || writeError || txError) && (
              <div style={{ color: "crimson" }}>
                {readError && <p>Read error: {readError.message}</p>}
                {writeError && <p>Write error: {writeError.message}</p>}
                {txError && <p>Tx error: {txError.message}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}