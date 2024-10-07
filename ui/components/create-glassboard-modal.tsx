import { Close } from "svg/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import Image from "next/image";
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
import { MoonPin } from "pages/create-GlassBoard";
import { contracts } from "constants/contracts";
import { PinataSDK } from "pinata-web3"
import { NavigationButton } from "./navigation-button";

// Environment variable for security

const PINATA_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YTAzNWNhNi01MGUwLTQzOTItOWZmYS0zODg1NzVmZDRlMDgiLCJlbWFpbCI6Im1hYXp3ZWIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzYTU3MWRjMjdmOWJmMDkwYjkzOSIsInNjb3BlZEtleVNlY3JldCI6ImNmODViNzRlYjBkZDBiMDVjZDJiYmQyYjE1NWE5Y2U3MDk3MjVmYTVkNTY0ZjgxMmJmNGUzMDRiM2MyYzg2N2UiLCJleHAiOjE3NTk1OTg2MTV9.Arf8VJVz3INKInUhcXcBQjGBqFy5VPkzkj2bh37cELg'
const NEXT_PUBLIC_GATEWAY_URL="crimson-lengthy-shrimp-899.mypinata.cloud"





export const pinata = new PinataSDK({
  pinataJwt: `${PINATA_JWT}`,
  pinataGateway: `${NEXT_PUBLIC_GATEWAY_URL}`
})

type CreateGlassBoardModalProps = {
  isOpen: boolean;
  close: () => void;
  name: string;
  moonPins: MoonPin[];
};

export const CreateGlassBoardModal = ({
  isOpen,
  close,
  name,
  moonPins,
}: CreateGlassBoardModalProps) => {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassBoardContract;
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

  const numPins = moonPins.filter((moonPin) => moonPin.selected).length;
  const pinFee = (pinFeeResult as BigNumber | undefined) ?? BigNumber.from(0);
  const totalPinFee = pinFee.mul(numPins);

  const totalFee = createBoardFee.add(totalPinFee);

  const [loadingState, setLoadingState] = useState<"initial" | "ipfs" | "mint">("initial");

  const loadingStateString = {
    ipfs: "Uploading to IPFS",
    mint: "Confirm in wallet...",
    initial: "Publish GlassBoard",
  }[loadingState];

  const { writeAsync: onCreateGlassBoard } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "createGlassBoard(string,string[])",
  });

  const { refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassBoards",
    args: [address],
  });

  const [successful, setSuccessful] = useState(false);

  const onSubmit = async () => {
    setSuccessful(false);
    setLoadingState("ipfs");

    console.log("Pinata Client Initialized:", pinata);

    // Log selected MoonPins before uploading
    const selectedMoonPins = moonPins.filter((moonPin) => moonPin.selected);
    console.log("Selected MoonPins:", selectedMoonPins);

    // Ensure at least one MoonPin is selected
    // if (selectedMoonPins.length === 0) {
    //   console.error("No MoonPins selected for upload.");
    //   setLoadingState("initial");
    //   return; // Exit if no pins are selected
    // }

    // Upload metadata to Pinata
    const tokenUris = await Promise.all(
      selectedMoonPins.map(async (moonPin) => {
        if (moonPin.selected && moonPin.imageFile) {

          const upload = await pinata.upload.file(moonPin.imageFile)
          console.log(upload);
    
          const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash)
          console.log(ipfsUrl);

          return ipfsUrl
         
        } else {
          console.warn(`Skipping upload for ${moonPin.name}: No image file.`);
          return null; // Skip if no image file
        }
      })
    );

    // Filter out null results from token URIs
    const validTokenUris = tokenUris.filter((uri) => uri !== null);

    // Check if any tokens were uploaded successfully
    // if (validTokenUris.length === 0) {
    //   console.error("No tokens were uploaded. Please check the images.");
    //   setLoadingState("initial");
    //   return; // Exit if no tokens were uploaded
    // }

    console.log("Token URIs:", validTokenUris);

    setLoadingState("mint");

    try {
      const sendTransactionResult = await onCreateGlassBoard?.({
        recklesslySetUnpreparedArgs: [name, validTokenUris],
        recklesslySetUnpreparedOverrides: {
          value: totalFee,
        },
      });

      await sendTransactionResult?.wait();

      const GlassBoards = await refetchGlassBoards();
      console.log("Updated GlassBoards:", GlassBoards);

      setLoadingState("initial");
      setSuccessful(true);
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      setLoadingState("initial");
    }
  };


  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <div className="m-4">
        <div className="flex justify-between mb-4">
          <div></div>
          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

        <div className="flex gap-4">
          <div className="w-full">
            <Image
              className="mb-4"
              width="112"
              height="30"
              alt=""
              src="/images/logo.png"
            />
            <p className="font-bold text-lg">Publish GlassBoard</p>
            <p className="text-sm">
              In order to create your GlassBoard you need to pay for each Moonpin
              you have created and a fee for creating the GlassBoard
            </p>
          </div>
          <div className="w-full">
            <p className="text-sm mt-4">GlassBoard Fee</p>
            <div className="flex justify-between">
              <h3 className="text-gray-500">{name}</h3>
              <h3 className="">
                {ethers.utils
                  .formatEther(createBoardFee.toString() ?? "0")
                  .toString()}
                ETH
              </h3>
            </div>

            <p className="text-sm mt-4">Moonpin Fees</p>
            <div className="flex justify-between">
              <h3 className="text-gray-500">Pins (x{numPins})</h3>
              <h3 className="">
                {ethers.utils
                  .formatEther(totalPinFee.toString() ?? "0")
                  .toString()}
                ETH
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
                ETH
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
                    Dashboard
                  </NavigationButton>
                )}
                {successful && <p className="text-right mt-2">Success!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
