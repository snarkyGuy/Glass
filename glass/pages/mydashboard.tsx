import { Button } from "components/button";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import Image from "next/image";
import { GlassBoardABI, GlasspinABI } from "contracts";
import { BigNumber } from "ethers";
import Masonry from "react-masonry-css";
import { useQuery } from "@tanstack/react-query";
import { IconButton } from "components/icon-button";
import { Thumb } from "assets/thumb";
import { CreateGlassboardTypeModal } from "components/glassboard-type-modal";
import { contracts } from "constants/contracts";
import Head from "next/head";
import { Select } from "components/select";
import { TailSpin } from "react-loader-spinner";

export default function MyDashboard() {
  const [slot, setSlot] = useState<"GlassBoards" | "settings">("GlassBoards");




  const getSlot = () => {
    switch (slot) {
      case "GlassBoards":
        return <GlassboardSlot />;
    }
  };

  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className="max-w-6xl mx-auto">
        <h1 className="my-12 text-center text-gray-600">My Dashboard</h1>
        <div className="flex justify-end text-gray-600 items-center mb-16">
          <div className="flex justify-between items-center space-x-4">
            <span>Payment Token</span>
            <SettingsSlot />
          </div>

          <Button className="ml-4" onClick={open}>
            Create Glassboard
          </Button>
        </div>
        <div className="max-w-6xl mx-auto">{getSlot()}</div>

        <CreateGlassboardTypeModal showDialog={showDialog} close={close} />
      </main>
    </div>
  );
}

type TabBarItemProps = {
  currentSlot: "GlassBoards" | "settings";
  slot: "GlassBoards" | "settings";
  onClick: () => void;
  children: React.ReactNode;
};

const TabBarItem = ({
  currentSlot,
  slot,
  onClick,
  children,
}: TabBarItemProps) => {
  const selected = currentSlot === slot;
  return (
    <button
      className={`bg-none  ${
        selected ? "font-bold border-b-4 border-b-primary-brand" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const GlassboardSlot = () => {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassboardContract;
  const { address } = useAccount();

  const { data, refetch: refetchGlassboards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassboards",
    args: [address],
  });

  const { writeAsync: deleteGlassboard } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "deleteGlassboard",
  });

  const onClickDeleteGlassboard = async (index: number) => {
    const sendTransactionResult = await deleteGlassboard({
      recklesslySetUnpreparedArgs: [index],
    });
    await sendTransactionResult.wait();
    await refetchGlassboards();
  };

  const glassboards = (data as any[]) ?? [];
  console.log("Glassboards:", glassboards);

  return (
    <div style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}>
      {glassboards.map((glassboard, index) => {
        const GlasspinIds = glassboard.GlasspinIds.map((n: BigNumber) =>
          n.toNumber()
        );
        const externalGlasspinIds = glassboard.externalGlasspinIds.map(
          (n: BigNumber) => n.toNumber()
        );

        return (
          <div key={index} className="mb-8">
            <Glassboard
              name={glassboard.name}
              GlasspinIds={[...GlasspinIds, ...externalGlasspinIds]}
              votes={glassboard.votes.toNumber()}
              pins={glassboard.pins.toNumber()}
              onClickDelete={() => onClickDeleteGlassboard(index)}
              index={index}
            />
          </div>
        );
      })}
    </div>
  );
};

type GlassboardProps = {
  name: string;
  GlasspinIds: number[];
  votes: number;
  pins: number;
  onClickDelete: () => void;
  index: number;
};

const Glassboard = ({
  name,
  GlasspinIds,
  votes,
  pins,
  index,
  onClickDelete,
}: GlassboardProps) => {
  const { address } = useAccount();

  return (
    <div
      style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}
      className="border-2 bg-white border-outlines rounded-xl overflow-hidden"
    >
      <div className="flex justify-between text-gray-700 bg-[#faebeb] px-8">
        <h3 className="py-2">Title : {name}</h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="">Total items :</p>
            <h3 className="">
              {GlasspinIds.length.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-700">Votes :</p>
            <h3 className="">
              {votes.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-700">Pins :</p>
            <h3 className="">
              {pins.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mx-8 my-8">
        <div className="flex gap-2"></div>
      </div>

      <div className="mx-8">
        <Masonry
          breakpointCols={4}
          className="flex w-auto my-8"
          columnClassName="first:pl-0 pl-4"
        >
          {GlasspinIds.map((GlasspinId) => (
            <GlasspinCard key={GlasspinId} GlasspinId={GlasspinId} />
          ))}
        </Masonry>
      </div>

   
        <div className="flex justify-end m-8">
        <div className=" flex gap-x-4 justify-evenly items-center">


          <Button onClick={onClickDelete}>Delete Board</Button>
        </div>
      </div>
    </div>
  );
};

type GlasspinCardProps = {
  GlasspinId: number;
};

const GlasspinCard = ({ GlasspinId }: GlasspinCardProps) => {
  // const votes = 0;
  const pins = 0;

  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlasspinContract;
  const { data: tokenUri, refetch: refetchGlassboards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "tokenURI",
    args: [GlasspinId],
  });

  const { data: Glasspin } = useQuery({
    queryKey: ["Glasspin", GlasspinId],
    queryFn: async () => {
      // Convert IPFS URI to URL using Pinata's gateway
      const url = tokenUri as string;
      console.log(url);

      return url;
    },
    enabled: !!tokenUri,
  });

  const { data: votes, refetch: refetchVotes } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getVotes",
    args: [GlasspinId],
  });
  const voteCount = (votes as BigNumber)?.toNumber() ?? 0;

  const { config: voteConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "vote",
    args: [GlasspinId],
    enabled: votes !== undefined && voteCount === 0,
  });
  const { writeAsync: vote } = useContractWrite(voteConfig);

  const onClickVote = async () => {
    const sendTransactionResult = await vote?.();
    await sendTransactionResult?.wait();

    refetchVotes();
  };

  const hasVoted = voteCount > 0;

  return (
    <div className=" relative border-2  rounded-lg overflow-hidden mb-4">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {Glasspin ? (
          <Image width={500} height={500} src={Glasspin} alt="" />
        ) : (
          <div className="mx-auto flex items-center justify-center">
            <TailSpin
              visible={true}
              height="80"
              width="80"
              color="#ffd0d0"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        )}
      </div>
      <div className="flex justify-between px-4 py-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <p className="">Votes</p>
            <h3 className="">
              {voteCount.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
          <div className="flex flex-col">
            <p className="">Pins</p>
            <h3 className="">
              {pins.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
        </div>
        <IconButton onClick={onClickVote}>
          <div className={`${hasVoted ? "rotate-180" : ""}`}>
            <Thumb />
          </div>
        </IconButton>
      </div>
    </div>
  );
};

const SettingsSlot = () => {
  return (
    <div className="">
      <Select
        className="bg-[#ffd0d0] "
        options={["HBAR", "USDT", "USDD", "USDC", "BTTC"]}
      />
    </div>
  );
};
