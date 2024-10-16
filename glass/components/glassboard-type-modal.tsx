import Link from "next/link";
import { Close } from "assets/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import { ModalOption } from "./modalOption";

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
      <div className="m-4">
        <div className="flex justify-between">
          <div>
            <h3>Create Glassboard</h3>
            <p className="">
              Choose what content you want to put into your board
            </p>
          </div>

          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

        <div className="h-0.5 -mx-4 bg-outlines my-4" />

        <div className="gap-4">
          <Link href="/create-Glassboard">
            <ModalOption>From uploaded images</ModalOption>
          </Link>
         

        </div>
      </div>
    </Modal>
  );
};
