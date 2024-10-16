import { Button } from "components/button";
import { Checkbox } from "components/checkbox";
import { IconButton } from "components/icon-button";
import { NavigationButton } from "components/navigation";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Masonry from "react-masonry-css";
import { Check } from "assets/check";
import { PlusCross } from "assets/plus-cross";
import { CreateGlassboardModal } from "components/glassboard-modal";
import Head from "next/head";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF"];

export default function CreateGlassboard() {
  const [files, setFiles] = useState<File[]>([]);

  const [pageState, setPageState] = useState<"upload" | "publish">("upload");

  return pageState === "upload" ? (
    <Upload files={files} setFiles={setFiles} setPageState={setPageState} />
  ) : (
    <Publish files={files} setPageState={setPageState} />
  );
}

type UploadProps = {
  files: File[];
  setFiles: (files: File[]) => void;
  setPageState: (pageState: "upload" | "publish") => void;
};
const Upload = ({ files, setFiles, setPageState }: UploadProps) => {
  const [myPictures, setMyPictures] = useState(false);
  const [communityGuidelines, setCommunityGuidelines] = useState(false);

  const handleChange = (files: FileList) => {
    setFiles(Array.from(files));
  };

  const canContinue =
    files.length === 0 ||
    (files.length > 0 && myPictures && communityGuidelines);

  return (
    <>
      <Head>
        <title>Create Glassboard</title>
      </Head>
      <main style={{ fontFamily: '"Akaya Kanadaka", system-ui' }} >
        <h1 className="m-12 text-center">Create Glassboard</h1>

        <div className="flex justify-between mb-16 max-w-6xl mx-auto">
          <NavigationButton href="/">Back</NavigationButton>

          <Button
            disabled={!canContinue}
            onClick={() => {
              setPageState("publish");
            }}
          >
            Continue
          </Button>
        </div>

        <div className="border-2 bg-white border-outlines rounded-md max-w-6xl mx-auto">
          <div className="m-4">
            <h3>Upload Pictures to create you board</h3>
            <p className="">
              Choose what content you want to put into your board
            </p>
          </div>

          <div className="h-0.5 bg-outlines my-4" />

          <div className="w-3/4 mx-auto mb-8 flex gap-4 items-center">
            <div className="grow">
              <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes}
                multiple
              >
                <div className="border-black border-2 border-dashed min-h-[128px] py-4 rounded-md flex items-center justify-center">
                  {files.length === 0 ? (
                    <p className="my-auto">Drag and drop</p>
                  ) : (
                    <div className="flex flex-col">
                      {files.map((file) => (
                        <p key={file.name} className="">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </FileUploader>
            </div>
          </div>

          <div className="w-3/4 mx-auto mb-8">
            <Checkbox
              id="my-pictures"
              checked={myPictures}
              label="These pictures are mine"
              onChange={(e) => setMyPictures(e.target.checked)}
            />
            <Checkbox
              id="community-guidelines"
              checked={communityGuidelines}
              label="I own these pictures ,I have read community guidelines"
              onChange={(e) => setCommunityGuidelines(e.target.checked)}
            />
          </div>
        </div>
      </main>
    </>
  );
};

type PublishProps = {
  files: File[];
  setPageState: (pageState: "upload" | "publish") => void;
};

export type Glasspin = {
  name: string;
  imageFile: File;
  selected: boolean;
};

const Publish = ({ files, setPageState }: PublishProps) => {
  const [enteringTitle, setEnteringTitle] = useState(false);
  const [GlassboardName, setGlassboardName] = useState("");
  const showPlaceholder = !enteringTitle && GlassboardName === "";

  const [Glasspins, setGlasspins] = useState<Glasspin[]>(
    files.map((file) => ({
      name: "",
      imageFile: file,
      selected: true,
    }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main style={{ fontFamily: '"Akaya Kanadaka", system-ui' }} >
      <div className="m-12 text-center relative h-12">
        <input
          className="w-full bg-background font-headers absolute top-0 left-0 bottom-0 outline-none text-5xl h-12
         text-center"
          onFocus={() => setEnteringTitle(true)}
          onBlur={() => setEnteringTitle(false)}
          value={GlassboardName}
          onChange={(e) => setGlassboardName(e.target.value)}
        />
        {showPlaceholder ? (
          <div className="flex items-center justify-center">
            <h1 className="relative pointer-events-none pl-2 pr-1 w-fit">
              Glassboard NAME
            </h1>
            <div className="w-0.5 h-10 mb-2 relative bg-black invisible animate-blink" />
          </div>
        ) : null}
      </div>

      <div className="flex justify-between mb-16 max-w-6xl mx-auto">
        <Button onClick={() => setPageState("upload")}>Back</Button>

        <Button onClick={() => setIsModalOpen(true)}>Publish Glassboard</Button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold">Your New Glasspins</h3>
            <p className="inline">
              Select which ones to keep and unselect which ones to exclude from
              your board
            </p>
          </div>

 
        </div>

        <Masonry
          breakpointCols={4}
          className="flex w-auto my-8"
          columnClassName="first:pl-0 pl-4"
        >
          {Glasspins.map((Glasspin) => (
            <GlasspinCard
              key={Glasspin.imageFile.name}
              image={URL.createObjectURL(Glasspin.imageFile)}
              title={Glasspin.name}
              selected={Glasspin.selected}
              onSelectedChange={(selected: boolean) => {
                setGlasspins((prev) =>
                  prev.map((pin) =>
                    pin.imageFile.name === Glasspin.imageFile.name
                      ? { ...pin, selected }
                      : pin
                  )
                );
              }}
              onTitleChange={(title: string) => {
                setGlasspins((prev) =>
                  prev.map((pin) =>
                    pin.imageFile.name === Glasspin.imageFile.name
                      ? { ...pin, name: title }
                      : pin
                  )
                );
              }}
            />
          ))}
        </Masonry>
      </div>

      <CreateGlassboardModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        name={GlassboardName}
        Glasspins={Glasspins}
      />
    </main>
  );
};

type GlasspinCardProps = {
  image: string;
  title: string;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onTitleChange: (title: string) => void;
};

const GlasspinCard = ({
  image,
  title,
  selected,
  onSelectedChange,
  onTitleChange,
}: GlasspinCardProps) => {
  const [enteringTitle, setEnteringTitle] = useState(false);
  const showPlaceholder = !enteringTitle && title === "";

  return (
    <div className=" bg-white rounded-2xl relative overflow-hidden mb-4">
      <div className="px-2 relative w-full h-12 flex items-center">
        <input
          className="placeholder:font-bold placeholder:text-primary-brand w-full
         font-headers absolute top-0 left-0 bottom-0 p-4 outline-none"
          onFocus={() => setEnteringTitle(true)}
          onBlur={() => setEnteringTitle(false)}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        {showPlaceholder ? (
          <div className="flex items-center">
            <h1 className="text-lg text-primary-brand relative pointer-events-none pl-2 pr-1 w-fit">
              ITEM NAME
            </h1>
            <div className="w-0.5 h-5 mb-1 relative bg-primary-brand invisible animate-blink" />
          </div>
        ) : null}
      </div>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" />
      </div>
      <div className="absolute bottom-2 right-2">
        {selected ? (
          <IconButton
            onClick={() => onSelectedChange(!selected)}
            className="bg-white"
          >
            <Check />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => onSelectedChange(!selected)}
            className="enabled:bg-primary-brand enabled:hover:bg-text-standard"
          >
            <PlusCross />
          </IconButton>
        )}
      </div>
    </div>
  );
};
