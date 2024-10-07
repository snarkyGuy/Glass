import Link from "next/link";
import { Close } from "svg/close";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";
import { ModalOption } from "./modal-option";

type CreateGlassBoardTypeModalProps = {
  showDialog: boolean;
  close: () => void;
};

export const CreateGlassBoardTypeModal = ({
  showDialog,
  close,
}: CreateGlassBoardTypeModalProps) => {
  return (
    <Modal isOpen={showDialog} onDismiss={close}>
      <div className="m-4">
        <div className="flex justify-between">
          <div>
            <h3>Create GlassBoard</h3>
            <p className="">
              Choose what content you want to put into your board
            </p>
          </div>

          <IconButton className="" onClick={close}>
            <Close />
          </IconButton>
        </div>

        <div className="h-0.5 -mx-4 bg-outlines my-4" />

        <div className="grid grid-cols-2 gap-4">
          <Link href="/create-GlassBoard">
            <ModalOption>From uploaded images</ModalOption>
          </Link>
          <ModalOption disabled>
            From another GlassBoard (coming soon)
          </ModalOption>

        </div>
      </div>
    </Modal>
  );
};
