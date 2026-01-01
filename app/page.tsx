"use client";

import { useBalance, useConnect, useConnection, useDisconnect } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";

import { useReadContract, useWriteContract } from "wagmi";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/contracts/counter";

export default function Home() {
  const { address, isConnected, chainId } = useConnection();
  const connect = useConnect();
  const disconnect = useDisconnect();

  const { data: balance, isLoading } = useBalance({
    address,
    chainId: chainId ?? sepolia.id,
    query: { enabled: !!address },
  });

  const networkName =
    chainId === sepolia.id ? "Sepolia" : chainId ? `Chain ${chainId}` : "-";

  // Read
  const { data: x, refetch } = useReadContract({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    functionName: "x",
    query: { enabled: isConnected }, // 可选：没连钱包时不读
  });

  // ✅ 合约写
  const { writeContractAsync, isPending } = useWriteContract();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>wagmi Starter Demo</h1>

      <p>Status: {connect.status}</p>

      {!isConnected ? (
        <div>
          <button onClick={() => connect.mutate({ connector: injected() })}>
            Connect Wallet (MetaMask)
          </button>

          {connect.error && (
            <p style={{ color: "crimson" }}>{connect.error.message}</p>
          )}
        </div>
      ) : (
        <div>
          <p>
            <b>Connected</b>
          </p>

          <p>Network: {networkName}</p>
          <p>Address: {address}</p>

          <p>
            Balance:{" "}
            {isLoading
              ? "Loading..."
              : balance
              ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`
              : "-"}
          </p>

          <button onClick={() => disconnect.mutate()}>Disconnect</button>

          <hr style={{ margin: "16px 0" }} />

          <h2>Counter Contract</h2>
          <div>Contract: {COUNTER_ADDRESS}</div>
          <div>Current x: {x?.toString() ?? "—"}</div>

          <div style={{ marginTop: 12 }}>
            <button
              disabled={isPending}
              onClick={async () => {
                await writeContractAsync({
                  abi: COUNTER_ABI,
                  address: COUNTER_ADDRESS,
                  functionName: "inc",
                });
                await refetch();
              }}
            >
              inc()
            </button>

            <button
              disabled={isPending}
              style={{ marginLeft: 8 }}
              onClick={async () => {
                await writeContractAsync({
                  abi: COUNTER_ABI,
                  address: COUNTER_ADDRESS,
                  functionName: "incBy",
                  args: [5n],
                });
                await refetch();
              }}
            >
              incBy(5)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
