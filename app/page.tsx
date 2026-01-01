"use client";

import { useBalance, useConnect, useConnection, useDisconnect } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";

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

          <button onClick={() => disconnect.mutate()}>
            Disconnect
          </button>
        </div>
      )}
    </main>
  );
}