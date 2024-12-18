import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { FilterTab, Filter } from "components/filter";
import Image from "next/image";
import { Button } from "components/button";
import { useState } from "react";
import { IconButton } from "components/icon-button";
import Link from "next/link";
import { Sort } from "assets/sort";
import { GlassBoardABI, GlasspinABI } from "contracts";
import { BigNumber } from "ethers";
import { Thumb } from "assets/thumb";
import { useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { formatTripleDigis } from "helpers/formatters";
import { CreateGlassboardTypeModal } from "../components/glassboard-type-modal";
import { contracts } from "constants/contracts";
import Head from "next/head";
import { TailSpin } from "react-loader-spinner";

export default function Home() {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassboardContract;
  const { data, refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getAllGlassboards",
    args: [],
  });
  const allGlassBoards = (data as any[]) ?? [];

  let index = 0;
  let prevOwner = allGlassBoards[0]?.owner ?? "";
  let GlassBoardsWithIndexes: any[] = [];
  allGlassBoards.forEach((Glassboard) => {
    if (Glassboard.owner !== prevOwner) {
      prevOwner = Glassboard.owner;
      index = 0;
    }
    GlassBoardsWithIndexes.push({ ...Glassboard, index });
    index += 1;
  });

  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <Head>
        <title>Glassboard</title>
      </Head>
      <main
        style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}
        className="max-w-6xl mx-auto"
      >
        <h1 className=" mt-20 mb-6 text-white text-center">
          A decentralized platform for exploring NFTs and creating tailored
          interest boards
        </h1>

        
     
        <div className="flex items-center mt-12 space-x-6  justify-center">
          <Filter>
            <FilterTab filter="pins" isDefault>
              <div className="flex items-center gap-2">
                <p>Sort By Pins</p>
                <Sort />
              </div>
            </FilterTab>
            <FilterTab filter="votes">
              <div className="flex items-center gap-2">
                <p>Sort By Votes</p>
                <Sort />
              </div>
            </FilterTab>
          </Filter>
          <Button onClick={open}>Create New Glassboard</Button>
        </div>

        <div className="grid sm:grid-cols-1 gap-4 md:grid-cols-2 mt-16">
          {GlassBoardsWithIndexes?.map((glassboard: any, key) => {
            const GlasspinIds = glassboard.GlasspinIds.map((n: BigNumber) =>
              n.toNumber()
            );
            const externalGlasspinIds = glassboard.externalGlasspinIds.map(
              (n: BigNumber) => n.toNumber()
            );

            return (
              <div key={key} className="">
                <Glassboard
                  title={glassboard.name}
                  votes={glassboard.votes.toNumber()}
                  pins={glassboard.pins.toNumber()}
                  owner={glassboard.owner}
                  index={glassboard.index}
                  GlasspinIds={[...GlasspinIds, ...externalGlasspinIds]}
                  refetch={refetchGlassBoards}
                />
              </div>
            );
          })}
        </div>

        <CreateGlassboardTypeModal showDialog={showDialog} close={close} />
      </main>
    </div>
  );
}

type GlassboardProps = {
  title: string;
  votes: number;
  pins: number;
  owner: string;
  index: number;
  GlasspinIds: number[];
  refetch: () => Promise<any>;
};
const Glassboard = ({
  title,
  votes,
  pins,
  owner,
  index,
  GlasspinIds,
  refetch,
}: GlassboardProps) => {
  return (
    <Link href={`/GlassBoards/${owner}/${index}`}>
      <div className="border-2  bg-white border-outlines rounded-xl overflow-hidden max-h-[800px]">
        <div className="flex justify-between bg-[#faebeb] px-4 py-2">
          <h3 className="text-gray-700">
            Board Name : <span className="text-gray-600">{title}</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
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
              <h3 className="text-gray-700">{formatTripleDigis(votes)}</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-700">Pins :</p>
              <h3 className="text-gray-700">{formatTripleDigis(pins)}</h3>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mx-4 my-8">
          <div className=""></div>
        </div>

        <div className="mx-4">
          <Masonry
            breakpointCols={2}
            className="flex w-auto my-8"
            columnClassName="first:pl-0 pl-4"
          >
            {GlasspinIds.map((GlasspinId) => (
              <GlasspinCard
                key={GlasspinId}
                GlasspinId={GlasspinId}
                onVote={refetch}
              />
            ))}
          </Masonry>
        </div>
      </div>
    </Link>
  );
};

type GlasspinCardProps = {
  GlasspinId: number;
  onVote: () => Promise<any>;
};

const GlasspinCard = ({ GlasspinId, onVote }: GlasspinCardProps) => {
  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlasspinContract;

  const { data: tokenUri, refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "tokenURI",
    args: [GlasspinId],
  });

  const { data: Glasspin } = useQuery({
    queryKey: ["Glasspin", GlasspinId],
    queryFn: async () => {
      const url = tokenUri as string;
      console.log(url);

      return url;
    },
    enabled: !!tokenUri,
  });

  const { address } = useAccount();

  const { data: votes, refetch: refetchVotes } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getVotes",
    args: [GlasspinId],
  });
  const voteCount = (votes as BigNumber)?.toNumber() ?? 0;

  // Fetch the correct pin count here and remove the default "pins = 0"
  const { data: pins, refetch: refetchPins } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getPins",
    args: [GlasspinId],
  });
  const pinCount = (pins as BigNumber)?.toNumber() ?? 0;

  const { data: voted, refetch: refetchVoted } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getVoted",
    args: [address, GlasspinId],
  });
  const hasVoted = (voted as boolean | undefined) ?? false;

  const { config: voteConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "vote",
    args: [GlasspinId],
    enabled: voted !== undefined && hasVoted === false,
  });
  const { writeAsync: vote } = useContractWrite(voteConfig);

  const { config: downvoteConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "downvote",
    args: [GlasspinId],
    enabled: voted !== undefined && hasVoted === true,
  });
  const { writeAsync: downvote } = useContractWrite(downvoteConfig);

  const onClickVote = async () => {
    if (hasVoted) {
      const sendTransactionResult = await downvote?.();
      await sendTransactionResult?.wait();
    } else {
      const sendTransactionResult = await vote?.();
      await sendTransactionResult?.wait();
    }

    await refetchVotes();
    await refetchVoted();

    await onVote();
  };

  const [showPinModal, setShowPinModal] = useState(false);

  return (
    <div>
      <div className="border-2 hover:scale-105 transition-transform duration-300 hover:border-gray-100 border-gray-200 hover:bg-[#fef3f3] rounded-2xl relative overflow-hidden mb-4 group">
        <div>
          {/* "Pin It" text positioned at the top left, hidden by default and displayed on hover */}
          <div className="absolute top-2 left-2 bg-[#faebeb] text-md px-2 py-1 rounded-md text-black opacity-0 group-hover:opacity-100 transition-opacity">
            Pin It!
          </div>

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
              <h3 className="">{voteCount}</h3>
            </div>
            <div className="flex flex-col">
              <p className="">Pins</p>
              <h3 className="">{pinCount}</h3>{" "}
            </div>
          </div>
          <div className="flex justify-between items-center">
          
            <IconButton onClick={onClickVote}>
              <div className={`${hasVoted ? "rotate-180" : ""}`}>
                <Thumb />
              </div>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};
