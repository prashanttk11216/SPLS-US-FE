import { Commodity } from "../enums/Commodity";
import { DispatchLoadStatus } from "../enums/DispatchLoadStatus";
import { DispatchLoadType } from "../enums/DispatchLoadType";
import { Equipment } from "../enums/Equipment";
import { LoadOption } from "../enums/LoadOption";
import { Mode } from "../enums/Mode";

export const equipmentOptions = Object.entries(Equipment).map(([key, label]) => ({
    value: key,
    label: label,
  }));
  
  export const modeOptions = Object.entries(Mode).map(([key, label]) => ({
    value: key,
    label: label,
  }));
  
  export const loadOptions = Object.entries(LoadOption).map(([key, label]) => ({
    value: key,
    label: label,
  }));
  
  export const commodityOptions = Object.entries(Commodity).map(([key, label]) => ({
    value: key,
    label: label,
  }));


  export const DispatchLoadTypeOptions = Object.entries(DispatchLoadType).map(
    ([key, label]) => ({
      value: key,
      label: label,
    })
  );

  export const DispatchLoadStatusOptions = Object.entries(DispatchLoadStatus).map(
    ([key, label]) => ({
      value: key,
      label: label,
    })
  );
  