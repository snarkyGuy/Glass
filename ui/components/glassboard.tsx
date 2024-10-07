import { useQuery } from "@tanstack/react-query";
import { contracts } from "constants/contracts";
import { MoonpinABI } from "contracts";
import { BigNumber } from "ethers";
import { formatTripleDigis } from "helpers/formatters";
import { ipfsToUrl } from "helpers/ipfs";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { Thumb } from "svg/thumb";
import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useChainId,
} from "wagmi";
import { Button } from "./button";
import { IconButton } from "./icon-button";

type GlassBoardProps = {
  title: string;
  moonpinIds: number[];
  votes: number;
  pins: number;
  onClickDelete: () => void;
  index: number;
  address: string;
};

export const GlassBoard = ({
  title,
  moonpinIds,
  votes,
  pins,
  index,
  onClickDelete,
  address,
}: GlassBoardProps) => {
  return (
    <div className="border-2 border-outlines rounded-xl overflow-hidden">
      <div className="flex justify-between bg-black px-8 py-4">
        <Link href={`/GlassBoards/${address}/${index}`}>
          <h3 className="text-white">{title}</h3>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-white">Votes</p>
            <h3 className="text-white">{formatTripleDigis(votes)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white">Pins</p>
            <h3 className="text-white">{formatTripleDigis(pins)}</h3>
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
            {moonpinIds.length.toLocaleString("en-US", {
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
          {moonpinIds.map((moonpinId) => (
            <MoonpinCard key={moonpinId} moonpinId={moonpinId} />
          ))}
        </Masonry>
      </div>

      <div className="flex justify-end m-8">
        <Button onClick={onClickDelete}>Delete GlassBoard</Button>
      </div>
    </div>
  );
};

type MoonpinCardProps = {
  moonpinId: number;
};

const MoonpinCard = ({ moonpinId }: MoonpinCardProps) => {
  // const votes = 0;
  const pins = 0;

  const chainId = useChainId();
  const contractAddress = contracts[chainId].moonpinContract;
  const { data: tokenUri, refetch: refetchGlassBoards } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: MoonpinABI.abi,
    functionName: "tokenURI",
    args: [moonpinId],
  });

  const { data: moonpin } = useQuery({
    queryKey: ["moonpin", moonpinId],
    queryFn: async () => {
      const url = ipfsToUrl(tokenUri as string);
      const response = await fetch(url);
      const data = await response.json();
      data.image = ipfsToUrl(data.image);
      return data;
    },
    enabled: !!tokenUri,
  });

  const { data: votes, refetch: refetchVotes } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: MoonpinABI.abi,
    functionName: "getVotes",
    args: [moonpinId],
  });
  const voteCount = (votes as BigNumber)?.toNumber() ?? 0;

  const { config: voteConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MoonpinABI.abi,
    functionName: "vote",
    args: [moonpinId],
    enabled: votes !== undefined && voteCount === 0,
  });
  const { writeAsync: vote } = useContractWrite(voteConfig);

  // const { data: votes, refetch: refetchVotes } = useContractRead({
  //   address: contractAddress as `0x${string}`,
  //   abi: MoonpinABI.abi,
  //   functionName: "votes",
  //   args: [moonpinId],
  // });

  const onClickVote = async () => {
    const sendTransactionResult = await vote?.();
    await sendTransactionResult?.wait();

    refetchVotes();
  };

  const hasVoted = voteCount > 0;

  return (
    <div className="border-2 border-outlines rounded-2xl relative overflow-hidden mb-4">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={moonpin?.image} alt="" />
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
          className={`bg-secondary-brand  px-4 rounded-full`}
        >
          <div className={`${hasVoted ? "rotate-180" : ""}`}>
            <Thumb />
          </div>
        </IconButton>
      </div>
    </div>
  );
};
