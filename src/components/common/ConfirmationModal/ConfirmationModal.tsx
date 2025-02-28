import React from "react";
import Modal from '../Modal/Modal'

interface ConfirmationPromptProps {
  isOpen: boolean;
  title: string;
  description: string;
  question: string;
  onConfirm: (value:any) => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationPromptProps> = ({
  isOpen,
  title,
  description,
  question,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="lg">
      <div>
        <p>{description}</p>
        <p>{question}</p>
        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-outline btn-lg" onClick={onCancel}>
            No
          </button>
          <button className="btn btn-accent btn-lg ms-2" onClick={() => onConfirm(true)}>
            Yes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;