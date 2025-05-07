import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { LucideIcon } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  onConfirm: () => void;
  isDangerous?: boolean;
  warningMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "danger",
  onConfirm,
  isDangerous = false,
  warningMessage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      classNames={{
        base: "border border-default-200 bg-default-50",
        header: "border-b border-default-200",
        footer: "border-t border-default-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
          <span>{title}</span>
        </ModalHeader>
        <ModalBody>
          {isDangerous && warningMessage && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                {Icon && (
                  <Icon
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`}
                  />
                )}
                <div>
                  <p className="font-medium">This action cannot be undone</p>
                  <p className="text-sm mt-1">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}
          <p>{description}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            color="default"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            startContent={Icon && <Icon className="h-4 w-4" />}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
