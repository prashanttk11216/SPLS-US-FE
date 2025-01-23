import { Commodity } from "../enums/Commodity";
import { DispatchLoadStatus } from "../enums/DispatchLoadStatus";
import { DispatchLoadType } from "../enums/DispatchLoadType";
import { Equipment } from "../enums/Equipment";
import { LoadOption } from "../enums/LoadOption";
import { Mode } from "../enums/Mode";

export const equipmentOptions = Object.entries(Equipment).map(([_, value]) => ({
    value: value,
    label: value,
  }));
  
  export const modeOptions = Object.entries(Mode).map(([_, value]) => ({
    value: value,
    label: value,
  }));
  
  export const loadOptions = Object.entries(LoadOption).map(([_, value]) => ({
    value: value,
    label: value,
  }));
  
  export const commodityOptions = Object.entries(Commodity).map(([_, value]) => ({
    value: value,
    label: value,
  }));


  export const DispatchLoadTypeOptions = Object.entries(DispatchLoadType).map(
    ([_, value]) => ({
      value: value,
      label: value,
    })
  );

  export const DispatchLoadStatusOptions = Object.entries(DispatchLoadStatus).map(
    ([_, value]) => ({
      value: value,
      label: value,
    })
  );
  