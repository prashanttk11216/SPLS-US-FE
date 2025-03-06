import React, { useCallback, useEffect, useRef, useState } from "react";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import SelectField from "../../../../components/common/SelectField/SelectField";
import DateInput from "../../../../components/common/DateInput/DateInput";
import { UserRole } from "../../../../enums/UserRole";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getUsers } from "../../../../services/user/userService";
import { toast } from "react-toastify";

interface ReoprtsFormProps {
  handleData: (data: any) => void;
}

export type ReportFormProps = {
  category: string;
  categoryValue: string;
  filterBy: string;
  dateRange: string;
};

const ReportForm: React.FC<ReoprtsFormProps> = ({ handleData }) => {
  const user = useSelector((state: RootState) => state.user);
  const [customers, setCustomers] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [filterBy, setFilterBy] = useState<string>("");
  const { control, getValues } = useForm<ReportFormProps>();
  const previousFormValues = useRef<any>({});

  const { getData } = useFetchData<any>({
    getAll: {
      user: getUsers,
    },
  });

  const fetchCustomersData = useCallback(
    async (category: string, page: number = 1, limit: number = 10) => {
      if (!user || !user._id) return; // Wait for user data
      try {
        const query = `?role=${
          category === "CUSTOMER" ? UserRole.CUSTOMER : UserRole.CARRIER
        }&page=${page}&limit=${limit}`;

        const result = await getData("user", query);
        if (result.success) {
          const users: any = [];
          const allArr: any = [
            {
              label: category === "CUSTOMER" ? "ALL CUSTOMER" : "ALL CARRIER",
              value: "ALL",
            },
          ];
          result?.data?.forEach((user) => {
            users.push({
              value: user._id,
              label: `${user.firstName} ${user.lastName} (${user.email})`,
            });
          });
          const combinedArr = allArr.concat(users);
          setCustomers(combinedArr);
        } else {
          toast.error(result.message || "Failed to fetch customers.");
        }
      } catch (err) {
        toast.error("Error fetching customer data.");
      }
    },
    [getData, user, category]
  );

  const formValues = useWatch({
    control,
    name: ["category", "categoryValue", "filterBy", "dateRange"],
  });

  useEffect(() => {
    const dateRange = getValues("dateRange");
    const fromDate = dateRange ? dateRange[0] : null;
    const toDate = dateRange ? dateRange[1] : null;

    const formData = {
      category: formValues[0],
      categoryValue: formValues[1],
      filterBy: formValues[2],
      fromDate: fromDate ? new Date(fromDate).toISOString() : null,
      toDate: toDate ? new Date(toDate).toISOString() : null,
    };

    // Only call handleData if formData has changed
    if (
      JSON.stringify(formData) !== JSON.stringify(previousFormValues.current)
    ) {
      handleData(formData);
      previousFormValues.current = formData;
    }
  }, [formValues, getValues, handleData]);

  return (
    <div>
      <form className="row g-3">
        <div className="col-md-6 mb-3">
          <SelectField
            label="Category"
            name="category"
            placeholder="Select Category"
            control={control}
            options={[
              { label: "Customer", value: "CUSTOMER" },
              { label: "Carrier", value: "CARRIER" },
            ]}
            onChangeOption={(value) => {
              setCategoryValue("");
              setCategory(value?.value!);
              fetchCustomersData(value?.value);
            }}
            defaultValue={category}
          />
        </div>
        <div className="col-md-6">
          <SelectField
            label="Customer"
            name="categoryValue"
            placeholder="Select Customer"
            control={control}
            options={customers}
            onChangeOption={(value) => setCategoryValue(value?.value!)}
            defaultValue={categoryValue}
          />
        </div>
        <div className="col-md-6">
          <SelectField
            label="Filter By"
            name="filterBy"
            placeholder="Select Date Field"
            control={control}
            options={[
              { label: "Delivery Date", value: "DEL_DATE" },
              { label: "Shipping Date", value: "SHIP_DATE" },
              { label: "Invoice Date", value: "INVOICE_DATE" },
            ]}
            onChangeOption={(value) => setFilterBy(value?.value!)}
            defaultValue={filterBy}
          />
        </div>
        <div className="col-md-6">
          <DateInput
            label="Date Range"
            placeholder="Select Date Range"
            name="dateRange"
            control={control} // Pass the control object from react-hook-form
            isRange={true}
            required={true}
            datePickerProps={{
              dateFormat: "yyyy/MM/dd", // Custom prop for formatting the date
              isClearable: true,
              selectsRange: true,
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
