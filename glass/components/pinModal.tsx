import { Close } from "assets/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import { Button } from "./button";
import { Select } from "./select";
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { GlassBoardABI } from "contracts";
import { useState, useEffect } from "react";
import { NavigationButton } from "./navigation";
import { BigNumber } from "ethers";
import { contracts } from "constants/contracts";

type PinSingleModalProps = {
  isOpen: boolean;
  close: () => void;
  title?: string;
  imageUrl: string;
  GlasspinId: number;
  boardOwner: string;
};

export const PinSingleModal = ({
  isOpen,
  close,
  title,
  imageUrl,
  GlasspinId,
  boardOwner,
}: PinSingleModalProps) => {
  const chainId = useChainId();
  const GlassboardContract = contracts[chainId].GlassboardContract;
  const { address } = useAccount();

  // Fetching the pin fee
  const { data: pinFeeResult } = useContractRead({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "pinFee",
  });

  const pinFee = (pinFeeResult as BigNumber | undefined) ?? BigNumber.from(0);

  // Fetching the user's glassboards
  const { data } = useContractRead({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassboards",
    args: [address],
  });

  const Glassboards = (data as any[]) ?? [];
  const GlassboardNames = Glassboards.map((Glassboard) => Glassboard.name);

  const [selectedGlassboard, setSelectedGlassboard] = useState<string>("");
  const [stage, setStage] = useState<"pin" | "payment" | "complete">("pin");
  const [continueButton, setContinueButton] = useState("Continue");

  // Prepare the contract write configuration
  const { config: pinConfig } = usePrepareContractWrite({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "pinToBoard",
    args: [GlasspinId, selectedGlassboard],
    enabled: selectedGlassboard !== "", // Check this value
  });

  const { writeAsync: onPinToBoard } = useContractWrite(pinConfig);

  const onClickPay = async () => {
    if (!onPinToBoard) {
      console.error("Transaction configuration is not ready");
      return;
    }

    try {
      setContinueButton("Confirming transaction...");
      const sendTransactionResult = await onPinToBoard(); // Initiate the transaction
      if (!sendTransactionResult) {
        console.error("Transaction initiation failed");
        setContinueButton("Continue");
        return;
      }

      await sendTransactionResult.wait(); // Wait for the transaction to be confirmed
      setStage("complete"); // Move to the next stage
      setContinueButton("Continue");
    } catch (error) {
      console.error("Error occurred during transaction", error);
      setContinueButton("Continue");
    }
  };

  const onDismiss = () => {
    close();
    setStage("pin");
    setSelectedGlassboard(""); // Reset the selected glassboard
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <div className="flex justify-between items-center px-6 py-4 ">
        <h3 className="mb-4 text-gray-700 text-lg">
          Title : <span className="text-gray-500">{title}</span>
        </h3>
        <IconButton onClick={close}>
          <Close />
        </IconButton>
      </div>
      <div className="mx-4 ">
        <div className="flex gap-4">
          <div className="border-2 border-outlines rounded-lg w-full overflow-hidden mb-4">
          <div className="bg-white py-2 px-4 text-gray-500  ">
              <Select
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setSelectedGlassboard(selectedValue);
                  console.log("Selected Glassboard ID:", selectedValue);
                }}
                value={selectedGlassboard}
                options={GlassboardNames}
                defaultOption="Select a Glassboard"
              />
            </div>


            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full rounded-md" src={imageUrl} alt="" />
          </div>

          {stage === "pin" && <Pin onClickPin={() => setStage("payment")} />}
          {stage === "payment" && (
            <Payment
              continueButton={continueButton}
              onClickPayment={onClickPay}
            />
          )}
          {stage === "complete" && <Complete />}
        </div>
      </div>
    </Modal>
  );
};

type PinProps = {
  onClickPin: () => void;
};
const Pin = ({ onClickPin }: PinProps) => {
  return (
    <div className="w-full flex flex-col justify-center">
      <p className="font-bold text-lg">Pin Glasspin</p>
      <p className="text-gray-400 mt-2">
      Pin this Glasspin ! Soon, you&apos;ll be able to pin multiple Glasspins simultaneously.
      </p>
      <Button onClick={onClickPin} className="my-8">
        Pin it
      </Button>
    </div>
  );
};

type PaymentProps = {
  onClickPayment: () => void;
  continueButton: string;
};
const Payment = ({ onClickPayment, continueButton }: PaymentProps) => {
  const pinFee = "None!";

  return (
    <div className="w-full flex flex-col justify-center">
      <p className="font-bold text-gray-600 text-xl">Pinning fee</p>
      <div className="flex text-gray-600 justify-between font-headers mt-4">
        <p>1 Pin</p>
        <p>{pinFee} </p> {/* Updated to show the continue button */}
      </div>
      <div className="flex text-primary-brand  justify-between font-headers mt-4">
        <p>Total</p>
        <p>{pinFee} </p> {/* Updated to show the continue button */}
      </div>
      <Button onClick={onClickPayment} className="my-8">
        {continueButton}
      </Button>
    </div>
  );
};

type CompleteProps = {};
const Complete = ({}: CompleteProps) => {
  return (
    <div className="w-full flex flex-col justify-center">
      <p className="font-bold text-lg text-gray-600">Already pinned!</p>
      <p className="my-4 text-gray-400">
        Go see all your boards or continue pinning.
      </p>
      <NavigationButton href="/mydashboard">See Boards</NavigationButton>
    </div>
  );
};
