import React, { useCallback, useEffect, useRef, useState } from "react";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import SelectField from "../../../../components/common/SelectField/SelectField";
import DateInput from "../../../../components/common/DateInput/DateInput";
import { UserRole } from "../../../../enums/UserRole";
import { hasAccess } from "../../../../utils/permissions";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getUsers } from "../../../../services/user/userService";
import { toast } from "react-toastify";

interface ReoprtsFormProps {
  handleData: (data: any) => void;
}

const ReportForm: React.FC<ReoprtsFormProps> = ({ handleData }) => {
  const user = useSelector((state: RootState) => state.user);
  const [customers, setCustomers] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [dateField, setDateField] = useState<string>("");
  const { control, getValues } = useForm<any>();
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
        let query = `?role=${
          category === "CUSTOMER" ? UserRole.CUSTOMER : UserRole.CARRIER
        }&page=${page}&limit=${limit}`;

        if (hasAccess(user.roles, { roles: [UserRole.BROKER_USER] })) {
          query += `&brokerId=${user._id}`;
        }
        const result = await getData("user", query);
        if (result.success) {
          let users: any = [];
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
    name: ["category", "categoryValue", "dateField", "dateRange"],
  });

  useEffect(() => {
    const dateRange = getValues("dateRange");
    const fromDate = dateRange ? dateRange[0] : null;
    const toDate = dateRange ? dateRange[1] : null;

    const formData = {
      category: formValues[0],
      categoryValue: formValues[1],
      filterBy: formValues[2],
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
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
        <SelectField
          label="Customer"
          name="categoryValue"
          placeholder="Select Customer"
          control={control}
          options={customers}
          onChangeOption={(value) => setCategoryValue(value?.value!)}
          defaultValue={categoryValue}
        />
        <SelectField
          label="Filter By"
          name="dateField"
          placeholder="Select Date Field"
          control={control}
          options={[
            { label: "Delivery Date", value: "DEL_DATE" },
            { label: "Shipping Date", value: "SHIP_DATE" },
            { label: "Invoice Date", value: "INVOICE_DATE" },
          ]}
          onChangeOption={(value) => setDateField(value?.value!)}
          defaultValue={dateField}
        />
        <DateInput
          label="Date Range"
          placeholder="Select Date Range"
          name="dateRange"
          control={control} // Pass the control object from react-hook-form
          isRange={true}
          required={true}
          datePickerProps={{
            dateFormat: "MM/dd/yyyy", // Custom prop for formatting the date
            isClearable: true,
            selectsRange: true,
          }}
        />
      </form>
    </div>
  );
};

export default ReportForm;
