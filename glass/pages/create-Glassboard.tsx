import { Button } from "components/button";
import { Checkbox } from "components/checkbox";
import { IconButton } from "components/icon-button";
import { NavigationButton } from "components/navigation";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Masonry from "react-masonry-css";
import { Check } from "assets/check";
import { MinusIcon } from "assets/MinusIcon";
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
      <main style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}>
        <h1 className="m-12 text-center text-gray-600">Create Glassboard</h1>

        <div className="flex mt-6  justify-between mb-16 max-w-6xl mx-auto">
          <NavigationButton href="/">Previous</NavigationButton>

          <Button
            disabled={!canContinue}
            onClick={() => {
              setPageState("publish");
            }}
          >
            Next
          </Button>
        </div>

        <div className="border-2 mx-auto bg-white border-outlines rounded-md max-w-6xl ">
          <div className="h-0.5 bg-outlines my-4" />

          <div className="w-3/4 mx-auto mb-8 flex gap-4 items-center">
            <div className="grow">
              <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes}
                multiple
              >
                <div className="border-gray-200 cursor-pointer border-2 p-8  min-h-[208px] py-4 rounded-md flex items-center justify-center">
                  {files.length === 0 ? (
                    <p className="my-auto text-gray-500 text-xl">
                      Choose a file or drag and drop it here
                    </p>
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

          {files.length !== 0 ? (
            <div className="w-3/4 mx-auto mb-8">
              <Checkbox
                id="community-guidelines"
                checked={communityGuidelines}
                label="I confirm that I own these pictures and have reviewed the community guidelines."
                onChange={(e) => {
                  setCommunityGuidelines(e.target.checked);
                  setMyPictures(true);
                }}
              />
            </div>
          ) : null}
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
    <main style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}>
      <div className="m-4 text-center relative h-16 "></div>

      <div className="max-w-6xl mx-auto">
        <div className="relative">
          <input
            className="w-full text-gray-600 bg-background outline-none h-full text-start text-5xl"
            onFocus={() => setEnteringTitle(true)}
            onBlur={() => setEnteringTitle(false)}
            value={GlassboardName}
            onChange={(e) => setGlassboardName(e.target.value)}
          />
          {showPlaceholder && !GlassboardName && (
            <div className="absolute top-0 left-0 flex items-center h-full pointer-events-none">
              <span className="text-gray-600 pl-2 text-5xl animate-blink">
                Add a title
              </span>
            </div>
          )}
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

        <div className="flex justify-end mb-16 max-w-6xl mx-auto">
          <Button onClick={() => setIsModalOpen(true)}>Next</Button>
        </div>
      </div>

      <div>
        <CreateGlassboardModal
          isOpen={isModalOpen}
          close={() => setIsModalOpen(false)}
          name={GlassboardName}
          Glasspins={Glasspins}
        />
      </div>
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
    <div className="bg-white rounded-2xl relative overflow-hidden mb-4">
    <div className="relative">
      <img src={image} alt="" className="w-full h-auto" />
  
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
            className="bg-white"
          >
            <MinusIcon />
          </IconButton>
        )}
      </div>
    </div>
  
    <div className="px-2 relative w-full h-14 flex items-center">
      <input
        className="placeholder:font-bold text-background text-xl placeholder:text-primary-brand w-full
        font-headers absolute top-0 left-0 bottom-0 p-4 outline-none"
        onFocus={() => setEnteringTitle(true)}
        onBlur={() => setEnteringTitle(false)}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      {showPlaceholder ? (
        <div className="flex items-center">
          <h1 className="text-lg text-primary-brand relative pointer-events-none pl-2 pr-1 w-fit">
            PIN NAME
          </h1>
          <div className="w-0.5 h-5 mb-1 relative bg-primary-brand invisible animate-blink" />
        </div>
      ) : null}
    </div>
  </div>
  
  );
};
