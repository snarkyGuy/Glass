import "@reach/dialog/styles.css";
import "styles/globals.css";
import { WagmiConfig, createClient, Chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Header } from "components/header";
import { Montserrat } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bttcTestnet , hederaPreviewnet } from "constants/custom-chains";


const montserrat = Montserrat({ subsets: ["latin"] });

const getChains = (): Chain[] => {

    return [bttcTestnet , hederaPreviewnet];
  
};

const client = createClient(
  getDefaultClient({
    appName: "Glassboard",
    chains: getChains(),
  })
);

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <QueryClientProvider client={queryClient}>
          <div>
            <Header />
            <div className="mx-8">
              <Component {...pageProps} />
            </div>
          </div>
        </QueryClientProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

/**
 * SSR doesn't work well with wagmi
 */
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
