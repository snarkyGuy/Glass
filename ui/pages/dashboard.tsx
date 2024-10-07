import { Button } from "components/button";
import { FilterTab, Filter } from "components/filter";
import Link from "next/link";
import { Sort } from "svg/sort";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { GlassBoardABI, GlassPinABI } from "contracts";
import { BigNumber } from "ethers";
import Masonry from "react-masonry-css";
import { useQuery } from "@tanstack/react-query";
import { IconButton } from "components/icon-button";
import { Thumb } from "svg/thumb";
import { CreateGlassBoardTypeModal } from "components/create-glassboard-type-modal";
import { contracts } from "constants/contracts";
import Head from "next/head";
import { Select } from "components/select";

export default function Dashboard() {
  const [slot, setSlot] = useState<"GlassBoards" | "settings">("GlassBoards");

  const getSlot = () => {
    switch (slot) {
      case "GlassBoards":
        return <GlassBoardSlot />;
      case "settings":
        return <SettingsSlot />;
    }
  };

  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className="max-w-6xl mx-auto">
        <h1 className="my-12 text-center">Dashboard</h1>

        <div className="flex justify-between mb-16">
          <div className="flex gap-8">
            <TabBarItem
              currentSlot={slot}
              slot="GlassBoards"
              onClick={() => setSlot("GlassBoards")}
            >
              GlassBoards
            </TabBarItem>
            <TabBarItem
              currentSlot={slot}
              slot="settings"
              onClick={() => setSlot("settings")}
            >
              Settings
            </TabBarItem>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center bg-[#faebeb]  gap-4 h-fit">
              <Filter>
                <FilterTab filter="pins" isDefault>
                  <div className="flex items-center gap-2">
                    <p>Most Pins</p>
                    <Sort />
                  </div>
                </FilterTab>
                <FilterTab filter="votes">
                  <div className="flex items-center gap-2">
                    <p>Most Votes</p>
                    <Sort />
                  </div>
                </FilterTab>
                <FilterTab filter="latest">
                  <div className="flex items-center gap-2">
                    <p>Latest</p>
                    <Sort />
                  </div>
                </FilterTab>
              </Filter>
            </div>
            <Button onClick={open}>Create GlassBoard</Button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">{getSlot()}</div>

        <CreateGlassBoardTypeModal showDialog={showDialog} close={close} />
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

const GlassBoardSlot = () => {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassBoardContract;
  const { address } = useAccount();

  const { data, refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassBoards",
    args: [address],
  });

  const { writeAsync: deleteGlassBoard } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "deleteGlassBoard",
  });

  const onClickDeleteGlassBoard = async (index: number) => {
    const sendTransactionResult = await deleteGlassBoard({
      recklesslySetUnpreparedArgs: [index],
    });
    await sendTransactionResult.wait();
    await refetchGlassBoards();
  };

  const GlassBoards = (data as any[]) ?? [];

  return (
    <div>
      {GlassBoards.map((GlassBoard, index) => {
        const GlassPinIds = GlassBoard.GlassPinIds.map((n: BigNumber) =>
          n.toNumber()
        );
        const externalGlassPinIds = GlassBoard.externalGlassPinIds.map(
          (n: BigNumber) => n.toNumber()
        );

        return (
          <div key={index} className="mb-8">
            <GlassBoard
              title={GlassBoard.name}
              GlassPinIds={[...GlassPinIds, ...externalGlassPinIds]}
              votes={GlassBoard.votes.toNumber()}
              pins={GlassBoard.pins.toNumber()}
              onClickDelete={() => onClickDeleteGlassBoard(index)}
              index={index}
            />
          </div>
        );
      })}
    </div>
  );
};

type GlassBoardProps = {
  title: string;
  GlassPinIds: number[];
  votes: number;
  pins: number;
  onClickDelete: () => void;
  index: number;
};

const GlassBoard = ({
  title,
  GlassPinIds,
  votes,
  pins,
  index,
  onClickDelete,
}: GlassBoardProps) => {
  const { address } = useAccount();

  return (
    <div className="border-2 bg-white border-outlines rounded-xl overflow-hidden">
      <div className="flex justify-between text-gray-700 bg-[#faebeb] px-8">
        <Link href={`/GlassBoards/${address}/${index}`}>
          <h3 className=" py-2">{title}</h3>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-700">Votes</p>
            <h3 className="">
              {votes.toLocaleString("en-US", {
                minimumIntegerDigits: 3,
                useGrouping: false,
              })}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-700">Pins</p>
            <h3 className="">
              {pins.toLocaleString("en-US", {
                minimumIntegerDigits: 3,
                useGrouping: false,
              })}
            </h3>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mx-8 my-8">
        <div className="flex gap-4">
          <h3>Creaated by:</h3>
          <p>You</p>
        </div>
        <div className="flex gap-2">
          <p className="">Total items</p>
          <h3 className="">
            {GlassPinIds.length.toLocaleString("en-US", {
              minimumIntegerDigits: 3,
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
          {GlassPinIds.map((GlassPinId) => (
            <GlassPinCard key={GlassPinId} GlassPinId={GlassPinId} />
          ))}
        </Masonry>
      </div>

      <div className="flex justify-end m-8">
        <Button onClick={onClickDelete}>Delete GlassBoard</Button>
      </div>
    </div>
  );
};

type GlassPinCardProps = {
  GlassPinId: number;
};

const GlassPinCard = ({ GlassPinId }: GlassPinCardProps) => {
  // const votes = 0;
  const pins = 0;

  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassPinContract;
  const { data: tokenUri, refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassPinABI.abi,
    functionName: "tokenURI",
    args: [GlassPinId],
  });

  const { data: GlassPin } = useQuery({
    queryKey: ["GlassPin", GlassPinId],
    queryFn: async () => {
      // Convert IPFS URI to URL using Pinata's gateway
      const url = (tokenUri as string);
      console.log(url);
  
      return url;
    },
    enabled: !!tokenUri,
  });

  const { data: votes, refetch: refetchVotes } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassPinABI.abi,
    functionName: "getVotes",
    args: [GlassPinId],
  });
  const voteCount = (votes as BigNumber)?.toNumber() ?? 0;

  const { config: voteConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: GlassPinABI.abi,
    functionName: "vote",
    args: [GlassPinId],
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
        <img src={GlassPin} alt="" />
      </div>
      <div className="flex justify-between px-4 py-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <p className="">Votes</p>
            <h3 className="">
              {voteCount.toLocaleString("en-US", {
                minimumIntegerDigits: 3,
                useGrouping: false,
              })}
            </h3>
          </div>
          <div className="flex flex-col">
            <p className="">Pins</p>
            <h3 className="">
              {pins.toLocaleString("en-US", {
                minimumIntegerDigits: 3,
                useGrouping: false,
              })}
            </h3>
          </div>
        </div>
        <IconButton
          onClick={onClickVote}
          className={`bg-secondary-brand  px-4 rounded-full
          ${hasVoted ? "bg-red-300 hover:bg-red-500" : ""}`}
        >
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
    <div className="flex items-center gap-4">
      <h3>Payout method</h3>
      <Select options={["ETH", "APE"]} />
      <Button>Confirm</Button>
    </div>
  );
};
