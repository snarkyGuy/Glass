import Link from "next/link";
import { Close } from "assets/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import { ModalOption } from "./modalOption";
import { UploadIcon } from "assets/UploadIcon";

type CreateGlassboardTypeModalProps = {
  showDialog: boolean;
  close: () => void;
};

export const CreateGlassboardTypeModal = ({
  showDialog,
  close,
}: CreateGlassboardTypeModalProps) => {
  return (
    <Modal isOpen={showDialog} onDismiss={close}>
      <div className="m-4 mt-6">
        <div className="flex  items-center justify-between">
          <div>
            <h3 className="text-gray-600">Set Up Your Glassboard</h3>
          </div>

          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

        <div className="  bg-outlines " />

        <div className="gap-2 m-8">
          <Link href="/create-Glassboard">
            <ModalOption>
              <div className=" flex flex-col mx-auto justify-center items-center">
                <UploadIcon />
                <h3 className="text-gray-400 mt-2">Upload Images</h3>
              </div>
            </ModalOption>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
