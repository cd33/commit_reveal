import "@rainbow-me/rainbowkit/styles.css";
import { configureChains, createClient } from "wagmi";
import { polygon, polygonMumbai, hardhat } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const { chains, provider } = configureChains(
  [polygon, polygonMumbai, hardhat],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      injectedWallet({ chains }),
      walletConnectWallet({ chains }),
      ledgerWallet({ chains }),
      coinbaseWallet({
        appName: "Commit_Reveal",
        chains: chains,
      }),
    ],
  },
]);
// const { connectors } = getDefaultWallets({
//   appName: 'My RainbowKit App',
//   chains,
// });

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { chains };
