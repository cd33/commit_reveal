import { createContext } from "react";
import { ReactElement } from "react";

type Context = {
  contractAddress: string;
  owner: string;
};

export const initialContext: Context = {
  contractAddress: "",
  owner: "",
};

export const EthersContext = createContext(initialContext);

export const EthersProvider = (props: { children: ReactElement }) => {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  return (
    <EthersContext.Provider
      value={{
        contractAddress,
        owner,
      }}
    >
      {props.children}
    </EthersContext.Provider>
  );
};

export default EthersContext;
