import "../styles/globals.css";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiClient, chains } from "../context/rainbow";
import { EthersProvider } from "../context/ethersProviderContext";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  const [isSSR, setIsSSR] = useState<boolean>(false);
  useEffect(() => {
    setIsSSR(true);
  }, []);
  if (!isSSR) return null;

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider modalSize="compact" chains={chains}>
        <EthersProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </EthersProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
