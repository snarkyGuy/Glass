import { useQuery } from "@tanstack/react-query";
import { Filter, FilterTab } from "components/filter";
import { IconButton } from "components/icon-button";
import { PinSingleModal } from "components/pinModal";
import { contracts } from "constants/contracts";
import { GlassBoardABI, GlasspinABI } from "contracts";
import { BigNumber } from "ethers";
import { formatTripleDigis } from "helpers/formatters";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Masonry from "react-masonry-css";
import { Sort } from "assets/sort";
import { Thumb } from "assets/thumb";
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";

export default function Glassboards() {
  const router = useRouter();
  const { owner, id } = router.query;

  const chainId = useChainId();
  const contractAddress = contracts[chainId].GlassboardContract;

  const { data, refetch: refetchGlassboard } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: GlassBoardABI.abi,
    functionName: "getGlassboard",
    args: [owner, id],
  });

  const Glassboard = data as any;
  const GlasspinIds: any[] = Glassboard?.GlasspinIds ?? [];
  const externalGlasspinIds: any[] = Glassboard?.externalGlasspinIds ?? [];
  const allGlasspins = [...GlasspinIds, ...externalGlasspinIds];

  const numGlasspins = allGlasspins.length ?? 0;
  const numPins =
    (Glassboard?.pins as BigNumber | undefined) ?? BigNumber.from(0);
  const numVotes =
    (Glassboard?.votes as BigNumber | undefined) ?? BigNumber.from(0);

  const title = Glassboard?.name ?? "";

  return (
    <div style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="max-w-6xl mx-auto">
        <h1 className="m-12 text-center">{title}</h1>

        <div className="flex justify-between my-10 mx-auto">
          <div className="flex gap-4">
            <h3 className="font-bold">Created by:</h3>
            <p className="inline">{owner}</p>
          </div>

          <div className="flex gap-2">
            <p className="text-outlines">Votes</p>
            <h3>{formatTripleDigis(numVotes.toNumber())}</h3>
            <p className="text-outlines">Pins</p>
            <h3>{formatTripleDigis(numPins.toNumber())}</h3>
            <p className="text-outlines">Items</p>
            <h3>{formatTripleDigis(numGlasspins)}</h3>
          </div>
        </div>

        <div className="">
          <Masonry
            breakpointCols={4}
            className="flex w-auto my-8"
            columnClassName="first:pl-0 pl-4"
          >
            {allGlasspins.map((GlasspinId: any) => (
              <GlasspinCard
                key={GlasspinId}
                GlasspinId={GlasspinId}
                onVote={() => refetchGlassboard()}
                boardOwner={Glassboard?.owner ?? ""}
              />
            ))}
          </Masonry>
        </div>
      </main>
    </div>
  );
}

type GlasspinCardProps = {
  GlasspinId: number;
  boardOwner: string;
  onVote: () => Promise<any>;
};

const GlasspinCard = ({
  GlasspinId,
  boardOwner,
  onVote,
}: GlasspinCardProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const GlasspinContract = contracts[chainId].GlasspinContract;
  const { data: tokenUri, refetch: refetchGlassboards } = useContractRead({
    address: GlasspinContract as `0x${string}`,
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

  const { data: voted, refetch: refetchVoted } = useContractRead({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getVoted",
    args: [address, GlasspinId],
  });
  const hasVoted = (voted as boolean) ?? false;

  const { data: pinned, refetch: refetchPinned } = useContractRead({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getHasPinned",
    args: [address, GlasspinId],
  });
  const hasPinned = (pinned as boolean) ?? false;

  const { data: votes, refetch: refetchVotes } = useContractRead({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getVotes",
    args: [GlasspinId],
  });
  const voteCount = (votes as BigNumber)?.toNumber() ?? 0;

  const { data: pins, refetch: refetchPins } = useContractRead({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "getPins",
    args: [GlasspinId],
  });
  const pinCount = (pins as BigNumber)?.toNumber() ?? 0;

  const { config: voteConfig } = usePrepareContractWrite({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "vote",
    args: [GlasspinId],
    enabled: voted !== undefined && hasVoted === false,
  });
  const { writeAsync: vote } = useContractWrite(voteConfig);

  const { config: pinConfig } = usePrepareContractWrite({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "pin",
    args: [GlasspinId],
    enabled: pinned !== undefined && hasPinned === false,
  });
  const { writeAsync: pin } = useContractWrite(pinConfig);

  const { config: downvoteConfig } = usePrepareContractWrite({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "downvote",
    args: [GlasspinId],
    enabled: voted !== undefined && hasVoted === true,
  });
  const { writeAsync: downvote } = useContractWrite(downvoteConfig);

  const { config: unpinConfig } = usePrepareContractWrite({
    address: GlasspinContract as `0x${string}`,
    abi: GlasspinABI.abi,
    functionName: "unpin",
    args: [GlasspinId],
    enabled: pinned !== undefined && hasPinned === true,
  });
  const { writeAsync: unpin } = useContractWrite(unpinConfig);

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

  const onClickPin = async () => {
    if (hasPinned) {
      const sendTransactionResult = await unpin?.();
      await sendTransactionResult?.wait();
    } else {
      const sendTransactionResult = await pin?.();
      await sendTransactionResult?.wait();
    }

    refetchPins();
  };

  const [showPinModal, setShowPinModal] = useState(false);

  return (
    <div
      style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}
      className="border-2 border-outlines bg-white rounded-2xl relative overflow-hidden mb-4"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Glasspin} alt="" />
        <div className="absolute bottom-2 right-2"></div>
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
              {pinCount.toLocaleString("en-US", {
                minimumIntegerDigits: 1,
                useGrouping: false,
              })}
            </h3>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          {" "}
          <h3 className="cursor-pointer hover:text-xl" onClick={() => setShowPinModal(true)}>
            Pin
          </h3>
        </div>
        <IconButton onClick={onClickVote} className="bg-secondary-brand">
          <div>
            <Thumb />
          </div>
        </IconButton>
      </div>

      <PinSingleModal
        isOpen={showPinModal}
        close={() => setShowPinModal(false)}
        title={""}
        imageUrl={Glasspin ?? ""}
        GlasspinId={GlasspinId}
        boardOwner={boardOwner}
      />
    </div>
  );
};
