import React, { useState } from "react";
import Modal from "../../../../../components/common/Modal/Modal";
import "./RoleDetailsModal.scss";

interface Permission {
    resource: string;
    actions: string[];
}

interface RoleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleData: {
        name: string;
        permissions: Permission[];
    };
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
    isOpen,
    onClose,
    roleData,
}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const actionColors = ["primary", "warning", "success", "info"];

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`User Role Details`} size="lg">
            <div className="role-details-modal">
                <h5 className="role-name">Role:{" "}
                    {
                    roleData.name === "broker_user"
                        ? "Broker User"
                        : roleData.name === "carrier"
                            ? "Carriers"
                            : roleData.name === "customer"
                                ? "Customers"
                                : roleData.name === "broker_admin"
                                    ? "Broker Admin"
                                    : ""
                }
                </h5>
                <hr />
                {roleData.permissions?.length === 0 && (
                    <>
                        <div className="text-center">No permissions assigned to this role.</div>
                        <hr />
                    </>
                )}
                <div className="accordion" id="permissionsAccordion">
                    {roleData?.permissions?.map((permission, index) => (
                        <div className="card" key={index}>
                            <div className="card-header" id={`heading${index}`}>
                                <h2 className="mb-0">
                                    <button
                                        className="btn btn-block text-left"
                                        type="button"
                                        onClick={() => toggleAccordion(index)}
                                        aria-expanded={activeIndex === index}
                                        aria-controls={`collapse${index}`}
                                    >
                                        {activeIndex === index ? 'Hide' : 'Show'} Permissions for {permission.resource}
                                    </button>
                                </h2>
                            </div>
                            <div
                                id={`collapse${index}`}
                                className={`collapse ${activeIndex === index ? "show" : ""}`}
                                aria-labelledby={`heading${index}`}
                                data-parent="#permissionsAccordion"
                            >
                                <div className="card-body">
                                    <h4>Resource: {permission.resource}</h4>
                                    <div>
                                        <strong>Actions:</strong>
                                    </div>
                                    <ul>
                                        {permission.actions.map((action, actionIndex) => (
                                            <li key={actionIndex}>
                                                <span className={`custom-badge custom-badge-${actionColors[actionIndex % actionColors.length]} mr-2`}>
                                                    {action}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default RoleDetailsModal;