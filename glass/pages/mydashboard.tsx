import { Button } from "components/button";
import { FilterTab, Filter } from "components/filter";
import Link from "next/link";
import { Sort } from "assets/sort";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
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

export default function MyDashboard() {
  const [slot, setSlot] = useState<"GlassBoards" | "settings">("GlassBoards");

  const getSlot = () => {
    switch (slot) {
      case "GlassBoards":
        return <GlassboardSlot />;
      case "settings":
        return <SettingsSlot />;
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
        <h1 className="my-12 text-center">My Dashboard</h1>

        <div className="flex justify-end mb-16">
          <div className="flex gap-8">
            <TabBarItem
              currentSlot={slot}
              slot="settings"
              onClick={() => setSlot("settings")}
            >
              Payment Setting
            </TabBarItem>

            <Button onClick={open}>Create Glassboard</Button>
          </div>
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
              title={Glassboard.name}
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
  title: string;
  GlasspinIds: number[];
  votes: number;
  pins: number;
  onClickDelete: () => void;
  index: number;
};

const Glassboard = ({
  title,
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
      
          <h3 className="py-2">GlassBoards</h3>
      

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-700">Votes</p>
            <h3 className="">
              {votes.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-700">Pins</p>
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
        <div className="flex gap-4">
          <h3>Created by:</h3>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <p className="">Total items</p>
          <h3 className="">
            {GlasspinIds.length.toLocaleString("en-US", {
              minimumIntegerDigits: 1,
              useGrouping: false,
            })}
          </h3>
        </div>
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
        <Button onClick={onClickDelete}>Delete Glassboard</Button>
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
    <div className=" relative border-2 border-black overflow-hidden mb-4">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Glasspin} alt="" />
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
          <div>
            <Thumb />
          </div>
        </IconButton>
      </div>
    </div>
  );
};

const SettingsSlot = () => {
  return (
    <div className="flex items-center gap-4">
      <h3>Payout method</h3>
      <Select options={["BTTC", "USDT"]} />
      <Button>Confirm</Button>
    </div>
  );
};
