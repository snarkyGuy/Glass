import { Close } from "assets/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";

import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
} from "wagmi";
import { GlassBoardABI } from "contracts";
import { BigNumber, ethers } from "ethers";
import { Button } from "./button";
import { useState } from "react";
import { Glasspin } from "../pages/create-Glassboard";
import { contracts } from "constants/contracts";
import { PinataSDK } from "pinata-web3";
import { NavigationButton } from "./navigation";

// Environment variable for security

const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YTAzNWNhNi01MGUwLTQzOTItOWZmYS0zODg1NzVmZDRlMDgiLCJlbWFpbCI6Im1hYXp3ZWIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzYTU3MWRjMjdmOWJmMDkwYjkzOSIsInNjb3BlZEtleVNlY3JldCI6ImNmODViNzRlYjBkZDBiMDVjZDJiYmQyYjE1NWE5Y2U3MDk3MjVmYTVkNTY0ZjgxMmJmNGUzMDRiM2MyYzg2N2UiLCJleHAiOjE3NTk1OTg2MTV9.Arf8VJVz3INKInUhcXcBQjGBqFy5VPkzkj2bh37cELg";
const NEXT_PUBLIC_GATEWAY_URL = "crimson-lengthy-shrimp-899.mypinata.cloud";

export const pinata = new PinataSDK({
  pinataJwt: `${PINATA_JWT}`,
  pinataGateway: `${NEXT_PUBLIC_GATEWAY_URL}`,
});

type CreateGlassboardModalProps = {
  isOpen: boolean;
  close: () => void;
  name: string;
  Glasspins: Glasspin[];
};

export const CreateGlassboardModal = ({
  isOpen,
  close,
  name,
  Glasspins,
}: CreateGlassboardModalProps) => {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassboardContract;
  const { address } = useAccount();

  // Fetching the fees for creating a board and pinning
  const { data: createBoardFeeResult } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "createBoardFee",
    args: [],
  });

  const createBoardFee =
    (createBoardFeeResult as BigNumber | undefined) ?? BigNumber.from(0);

  const { data: pinFeeResult } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "pinFee",
    args: [],
  });

  const numPins = Glasspins.filter((Glasspin) => Glasspin.selected).length;
  const pinFee = (pinFeeResult as BigNumber | undefined) ?? BigNumber.from(0);
  const totalPinFee = pinFee.mul(numPins);

  const totalFee = createBoardFee.add(totalPinFee);

  const [loadingState, setLoadingState] = useState<"initial" | "ipfs" | "mint">(
    "initial"
  );

  const loadingStateString = {
    ipfs: "Uploading to IPFS",
    mint: "Confirm in wallet...",
    initial: "Publish Glassboard",
  }[loadingState];

  const { writeAsync: onCreateGlassboard } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "createGlassboard(string,string[])",
  });

  const { refetch: refetchGlassboards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassboards",
    args: [address],
  });

  const [successful, setSuccessful] = useState(false);

  const onSubmit = async () => {
    setSuccessful(false);
    setLoadingState("ipfs");

    console.log("Pinata Client Initialized:", pinata);

    // Log selected Glasspins before uploading
    const selectedGlasspins = Glasspins.filter((Glasspin) => Glasspin.selected);
    console.log("Selected Glasspins:", selectedGlasspins);

    // Upload metadata to Pinata
    const tokenUris = await Promise.all(
      selectedGlasspins.map(async (Glasspin) => {
        if (Glasspin.selected && Glasspin.imageFile) {
          const upload = await pinata.upload.file(Glasspin.imageFile);
          console.log(upload);

          const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);
          console.log(ipfsUrl);

          return ipfsUrl;
        } else {
          console.warn(`Skipping upload for ${Glasspin.name}: No image file.`);
          return null; // Skip if no image file
        }
      })
    );

    // Filter out null results from token URIs
    const validTokenUris = tokenUris.filter((uri) => uri !== null);

    console.log("Token URIs:", validTokenUris);

    setLoadingState("mint");

    try {
      const sendTransactionResult = await onCreateGlassboard?.({
        recklesslySetUnpreparedArgs: [name, validTokenUris],
        recklesslySetUnpreparedOverrides: {
          value: totalFee,
        },
      });

      await sendTransactionResult?.wait();

      const Glassboards = await refetchGlassboards();
      console.log("Updated Glassboards:", Glassboards);

      setLoadingState("initial");
      setSuccessful(true);
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      setLoadingState("initial");
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={close} >
      <div className="m-4">
        <div className="flex justify-between mb-4">
          <div></div>
          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

      
      <div className="w-full flex flex-col justify-center ">
            <h2 className="mb-4">Publish</h2>
            {/* <p className="font-bold text-lg"></p> */}
            <p className="text-md">
              <p className="text-md">
                To create your Glassboard, you&apos;ll need to pay for each
                Glasspin you&apos;ve added, along with a fee for setting up the
                Glassboard.
              </p>
            </p>
          
      <div className="w-full flex flex-col justify-center ">
            <p className="text-md mt-4">Glassboard Fee</p>
            <div className="flex justify-between">
              <h3 className="text-gray-500">{name}</h3>
              <h3 className="">
                {ethers.utils
                  .formatEther(createBoardFee.toString() ?? "0")
                  .toString()}
                BTT
              </h3>
            </div>

            <p className="text-md mt-4">Glasspin Fees</p>
            <div className="flex justify-between">
              <h3 className="text-gray-500">Pins (x{numPins})</h3>
              <h3 className="">
                {ethers.utils
                  .formatEther(totalPinFee.toString() ?? "0")
                  .toString()}
                BTT
              </h3>
            </div>

            <div className="flex justify-between text-primary-brand mt-4">
              <h3 className="">Total</h3>
              <h3 className="">
                {ethers.utils
                  .formatEther(
                    createBoardFee.add(totalPinFee).toString() ?? "0"
                  )
                  .toString()}
                BTT
              </h3>
            </div>

            <div className="flex justify-between mt-4">
              <div />
              <div>
                {!successful ? (
                  <Button
                    onClick={onSubmit}
                    disabled={!["initial"].includes(loadingState)}
                  >
                    {loadingStateString}
                  </Button>
                ) : (
                  <NavigationButton href="/dashboard">
                    Go to Dashboard
                  </NavigationButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
