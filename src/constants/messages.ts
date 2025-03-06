// src/constants/messages.ts
export const VALIDATION_MESSAGES = {
    defaultRequired: "Field is required",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email format",
    passwordRequired: "Password is required",
    passwordPattern:
      "Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character",
    confirmPasswordRequired: "Confirm Password is required",
    passwordsNotMatch: "Passwords do not match",
    roleRequired: "Please select a role",
    lastNameRequired: "Last Name is required",
    primaryNumberRequired: "Primary Number is required",
    firstNameRequired: "First Name is required",
    roleNameRequired: "Role name is required",
    quoteNameRequired: "Quote name is required",
    resourceRequired: "Resource is required",
    actionsRequired: "At least one action is required",
    employeeIdRequired: "Employee Id is required",
    addressRequired: "Address is required.",
    countryRequired: "Country is required.",
    stateRequired: "State is required.",
    cityRequired: "City is required.",
    zipRequired: "Zip code is required.",
    nonNegative: "Value must be non-negative",
    percentageRange: "Percentage must be between 0 and 100.",


    //load 

    originRequired: "Origin is required",
    destinationRequired: "Destination is required",
    dateRequired: "Date is required",
    locationInvalid: "Please enter a valid location (type a zip code and select an address from the dropdown)",
  };
  
  export const ERROR_MESSAGES = {
    passwordResetError: "An error occurred while resetting the password. Please try again.",
    emailCheckError: "An error occurred while verifying the email. Please try again.",
  };
  
  export const SUCCESS_MESSAGES = {
    passwordReset: "Your password has been successfully reset.",
  };
  