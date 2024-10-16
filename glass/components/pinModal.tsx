import { Close } from "assets/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import Image from "next/image";
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
import { useState } from "react";
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
  title = "",
  imageUrl,
  GlasspinId,
  boardOwner,
}: PinSingleModalProps) => {
  const chainId = useChainId();
  const GlassboardContract = contracts[chainId].GlassboardContract;
  const { address } = useAccount();

  const { data: pinFeeResult, refetch: refetchFee } = useContractRead({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "pinFee",
    args: [],
  });
  const pinFee = (pinFeeResult as BigNumber | undefined) ?? BigNumber.from(0);

  const { data, refetch: refetchGlassboards } = useContractRead({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassboards",
    args: [address],
  });
  const Glassboards = (data as any[]) ?? [];
  const GlassboardNames = Glassboards.map((Glassboard) => Glassboard.name);
  GlassboardNames.push("Create new Glassboard...");
  const [selectedGlassboard, setSelectedGlassboard] = useState("");

  const { config: pinConfig } = usePrepareContractWrite({
    address: GlassboardContract as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "pinToBoard",
    args: [boardOwner, GlasspinId, Number(selectedGlassboard)],
    enabled: selectedGlassboard !== "",
    overrides: {
      value: pinFee,
    },
  });
  const { writeAsync: onPinToBoard } = useContractWrite(pinConfig);

  const [stage, setStage] = useState<"pin" | "payment" | "complete">("pin");

  const onClickPay = async () => {
    const sendTransactionResult = await onPinToBoard?.();
    await sendTransactionResult?.wait();
    setStage("complete");
  };

  const onDismiss = () => {
    close();
    setStage("pin");
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <div className="m-4">
        <div className="flex justify-between mb-4">
          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

        <div className="flex gap-4">
          <div className="border-2 border-outlines rounded-lg w-full overflow-hidden">
            <div className="bg-white py-2 px-4 h-8 flex items-center">
              <h3 className="">{title === "" ? "No title" : title}</h3>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" />
            <div className="bg-white py-2 px-4 h-8 flex items-center">
              <Select
                onChange={(e) => setSelectedGlassboard(e.target.value)}
                value={selectedGlassboard}
                options={GlassboardNames}
                defaultOption="Select a Glassboard"
              />
            </div>
          </div>

          {stage === "pin" && <Pin onClickPin={() => setStage("payment")} />}
          {stage === "payment" && <Payment onClickPayment={onClickPay} />}
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
    <div className="w-full flex flex-col justify-center ">
      <p className="font-bold text-lg">Pin Glasspin</p>
      <p className="">
        You can pin this Glasspin or choose to pin many (coming soon!).
      </p>
      <Button onClick={onClickPin} className="my-8">
        Pin it
      </Button>
    </div>
  );
};

type PaymentProps = {
  onClickPayment: () => void;
};
const Payment = ({ onClickPayment }: PaymentProps) => {
  const pinFee = 0.0001;
  return (
    <div className="w-full flex flex-col justify-center ">
      <p className="font-bold text-lg">Pin fee</p>
      <div className="text-primary-brand flex justify-between font-headers mt-4">
        <p className="">1 Pin</p>
        <p>{pinFee} BTT</p>
      </div>
      <div className=" flex justify-between font-headers mt-4">
        <p className="">Total</p>
        <p>{pinFee} BTT</p>
      </div>
      <Button onClick={onClickPayment} className="my-8">
        Continue
      </Button>
    </div>
  );
};

type CompleteProps = {};
const Complete = ({}: CompleteProps) => {
  return (
    <div className="w-full flex flex-col justify-center ">
      <p className="font-bold text-lg">Well done pinning!</p>
      <p className="my-4">Go see all your boards or continue pinning</p>
      <NavigationButton href="/dashboard">See Boards</NavigationButton>
    </div>
  );
};
