import Avatar from "../../../../../components/common/Avatar/Avatar";
import Table from "../../../../../components/common/Table/Table";
import PlusIcon from '../../../../../assets/icons/plus.svg'

const CustomerList = () => {
  const columns = [
    { key: "name", label: "Name", width: "40%" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", isAction: true },
  ];

  const data = [
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
    {
      name: (
        <div className="d-flex align-items-center">
          <div className="avatar_wrapper me-2">
            <Avatar  firstName="Avi" lastName="Patel" email="avi@gmail.com" size={35}/>
          </div>
          <div className="name">Avi Patel</div>
        </div>
      ),
      email: "avi@gmail.com",
      contact: "+91 1234567890",
      company: "ABC",
      status: "Active",
    },
  ];

  const handleActionClick = (action: string, row: Record<string, any>) => {
    console.log(`Action "${action}" clicked for row:`, row);
  };

  return (
    <div className="customers-list-wrapper">
      <h2 className="fw-bolder">Customers</h2>
      <div className="d-flex align-items-center my-3">

        <button className="btn btn-accent d-flex align-items-center ms-auto" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">
          <img src={PlusIcon} height={16} width={16} className="me-2"/>
          Create
          </button>
      </div>
      <Table
        columns={columns}
        data={data}
        actions={["Edit", "Delete", "View"]}
        onActionClick={handleActionClick}
      />

<div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        ...
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default CustomerList;
