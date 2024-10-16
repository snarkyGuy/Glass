import { useQuery } from "@tanstack/react-query";
import { contracts } from "constants/contracts";
import { GlasspinABI } from "contracts";
import { BigNumber } from "ethers";
import { formatTripleDigis } from "helpers/formatters";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { Thumb } from "assets/thumb";
import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useChainId,
} from "wagmi";
import { Button } from "./button";
import { IconButton } from "./icon-button";

type GlassboardProps = {
  title: string;
  GlasspinIds: number[];
  votes: number;
  pins: number;
  onClickDelete: () => void;
  index: number;
  address: string;
};

export const Glassboard = ({
  title,
  GlasspinIds,
  votes,
  pins,
  index,
  onClickDelete,
  address,
}: GlassboardProps) => {
  return (
    <div className="border-2 border-outlines rounded-xl overflow-hidden">
      <div className="flex justify-between bg-black px-8 py-4">
        <Link href={`/Glassboards/${address}/${index}`}>
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
            {GlasspinIds.length.toLocaleString("en-US", {
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
      const url = (tokenUri as string);
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

  // const { data: votes, refetch: refetchVotes } = useContractRead({
  //   address: contractAddress as `0x${string}`,
  //   abi: GlasspinABI.abi,
  //   functionName: "votes",
  //   args: [GlasspinId],
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
        <img src={Glasspin} alt="" />
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
