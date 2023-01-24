import type { NextPage } from "next";
import { useState, useCallback, useEffect } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import useEthersProvider from "../context/useEthersProvider";
import { Bytes, ethers } from "ethers";
import CommitReveal from "../../artifacts/contracts/CommitReveal.sol/CommitReveal.json";
import { Blocks } from "react-loader-spinner";
import signatures from "../context/signatures.json";

const candidates = ["toto", "tata", "tutu"];

const Home: NextPage = () => {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { contractAddress, owner } = useEthersProvider();

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [hashVote, setHashVote] = useState<string>("");
  const [hashSalt, setHashSalt] = useState<string>("");
  const [hash, setHash] = useState<Bytes>();
  const [actualStep, setActualStep] = useState<number>(0);
  const [results, setResults] = useState<number[]>([]);

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const getDatas = useCallback(async () => {
    setIsLoading(true);
    if (provider && address && contractAddress) {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          CommitReveal.abi,
          provider
        );
        const step = await contract.step();
        setActualStep(parseInt(step));
        if (step === 0 && signatures.hasOwnProperty(address)) {
          setIsWhitelisted(true);
        }
        if (step === 2) {
          let tempArr: number[] = [];
          for (const can of candidates) {
            const res = await contract.getVotes(can);
            tempArr[candidates.indexOf(can)] = parseInt(res);
          }
          setResults(tempArr);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }, [address, provider, contractAddress]);

  useEffect(() => {
    if (address) {
      getDatas();
    }
  }, [address, getDatas]);

  const getHash = async (hashVote: string, hashSalt: string) => {
    if (!hashVote || hashVote === "" || !hashSalt || hashSalt === "") {
      setError("Please enter a vote and password");
      return;
    }

    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contractAddress,
        CommitReveal.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const hash = await contract.getHash(hashVote, hashSalt, overrides);
        setHash(hash);
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          setError("Error getHash, more informations on the console");
        } else {
          console.log(String(error));
          setError("Error getHash, more informations on the console");
        }
        setIsLoading(false);
      }
    }
  };

  const commitVote = async (hash: Bytes) => {
    if (!hash) {
      setError("Please generate a hash");
      return;
    }

    if (provider && signer && address) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contractAddress,
        CommitReveal.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.commitVote(hash, signatures[address as keyof typeof signatures], overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          setError("Error commitVote, more informations on the console");
        } else {
          console.log(String(error));
          setError("Error commitVote, more informations on the console");
        }
        setIsLoading(false);
      }
    }
  };

  const revealVote = async (revealVote: string, revealSalt: string) => {
    if (!revealVote || revealVote === "" || !revealSalt || revealSalt === "") {
      setError("Please enter your vote and password");
      return;
    }

    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contractAddress,
        CommitReveal.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.revealVote(
          revealVote,
          revealSalt,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          setError("Error revealVote, more informations on the console");
        } else {
          console.log(String(error));
          setError("Error revealVote, more informations on the console");
        }
        setIsLoading(false);
      }
    }
  };

  const setStep = async () => {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contractAddress,
        CommitReveal.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.setStep(overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          setError("Error setStep, more informations on the console");
        } else {
          console.log(String(error));
          setError("Error setStep, more informations on the console");
        }
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="home">
      <p style={{ fontSize: "2em" }}>Commit-Reveal-ECDSA</p>
      {isLoading ? (
        <Blocks
          visible={true}
          height="30"
          width="30"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
        />
      ) : (
        <>
          {error && <p style={{ fontSize: "2em", color: "red" }}>{error}</p>}

          {actualStep === 2 && results ? (
            <>
              <p style={{ fontSize: "2em" }}>Results</p>
              <table>
                <tbody>
                  <tr>
                    {candidates.map((can) => (
                      <th key={can}>{capitalizeFirstLetter(can)}</th>
                    ))}
                  </tr>
                  <tr>
                    {results.map((res, i) => (
                      <th key={i}>{res}</th>
                    ))}
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p>Get your hash to {actualStep === 0 ? "vote" : "reveal"}</p>
                <select onChange={(e) => setHashVote(e.target.value)}>
                  <option value="">Please choose an candidate</option>
                  <option value="toto">TOTO</option>
                  <option value="tata">TATA</option>
                  <option value="tutu">TUTU</option>
                </select>
                <input
                  placeholder="Please enter a password(salt)"
                  onChange={(e) => setHashSalt(e.target.value)}
                  style={{
                    marginRight: "2vw",
                    margin: "1em",
                    minWidth: "15vw",
                  }}
                />
                {isLoading ? (
                  <Blocks
                    visible={true}
                    height="30"
                    width="30"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                  />
                ) : (
                  <button onClick={() => getHash(hashVote, hashSalt)}>
                    GET HASH
                  </button>
                )}
                {hash && (
                  <>
                    <p>Your hash:</p> {hash}
                  </>
                )}
              </div>

              {actualStep === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {isWhitelisted ? (
                    <>
                      {hash ? (
                        <>
                          <p style={{ marginTop: "10vh" }}>Now you can vote</p>
                          <button onClick={() => commitVote(hash)}>VOTE</button>
                        </>
                      ) : (
                        <p style={{ fontSize: "2em" }}>
                          To vote generate your hash
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: "2em" }}>
                      You&apos;re not whitelisted, you can&apos;t vote
                    </p>
                  )}
                </div>
              )}

              {actualStep === 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {hashVote && hashSalt ? (
                    <>
                      <p style={{ marginTop: "10vh" }}>
                        Now you can reveal your vote
                      </p>
                      <button onClick={() => revealVote(hashVote, hashSalt)}>
                        REVEAL
                      </button>
                    </>
                  ) : (
                    <p style={{ fontSize: "2em" }}>
                      To reveal your vote, complete the two fields above
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          {owner === address && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <p style={{ color: "red" }}>ADMIN : Set Step</p>
              <button onClick={setStep}>SET STEP</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
