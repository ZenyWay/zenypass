/**
 * Clément Bonet
 */
/** @jsx createElement */
//
import { createElement } from "create-element"
import { Modal, ModalHeader } from "reactstrap"

export interface modalProps {
    isOpen:boolean,
    title:string,
    onCancel: () => void
    [prop: string]: any
  }

export default function ({
    children,
    isOpen,
    onCancel,
    title
  }:Partial<modalProps>) {

    return (
      <Modal isOpen={isOpen} toggle={onCancel} autoFocus backdrop>
        <ModalHeader toggle={onCancel} className="bg-info text-white" >
          {title}
        </ModalHeader>
        {children}
    </Modal>
    )
  }
