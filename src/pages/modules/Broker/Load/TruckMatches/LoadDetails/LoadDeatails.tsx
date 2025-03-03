import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../store/store";
import useFetchData from "../../../../../../hooks/useFetchData/useFetchData";
import { toast } from "react-toastify";
import Loading from "../../../../../../components/common/Loading/Loading";
import { useParams } from "react-router-dom";
import { getLoadById } from "../../../../../../services/load/loadServices";
import { Load } from "../../../../../../types/Load";
import { formatDate } from "../../../../../../utils/dateFormat";
import { getEnumValue } from "../../../../../../utils/globalHelper";
import { Equipment } from "../../../../../../enums/Equipment";
import { Mode } from "../../../../../../enums/Mode";

const LoadDetails: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { loadId } = useParams();
  const [loadDetails  , setLoadDetails] = useState<Partial<Load> | null>(null);
  const { getDataById, loading } = useFetchData<any>({
    getById: {
      load: getLoadById,
    },
  });

  const fetchLoad = useCallback(async () => {
    if (!user || !user._id) return;
    try {
      const result = await getDataById("load", loadId!);
      if (result.success) {
        const load = result.data as Load[];
        setLoadDetails(load);
      }
    } catch (err) {
      toast.error("Error fetching Consignee data.");
    }
  }, [getDataById, user, loadId]);

  useEffect(() => {
    if (user && user._id) {
      fetchLoad();
    }
  }, [user, loadId]);

  return (
    <div className="consignee-list-wrapper">
      <h2 className="fw-bolder">Load Details</h2>

      {loading ? (
        <Loading />
      ) : (
        <>
          {loadDetails && (
            <div className="row">
              <div className="col-12 bg-dark-blue text-white">
                <h5 className="m-0 fw-bold">TRIP</h5>
              </div>
              <div className="col-4 mt-2">
                <div className="d-flex">
                  <div className="fw-bold">Origin : </div>
                  <div className="ms-2">{loadDetails?.origin?.str}</div>
                </div>
                <div className="d-flex">
                  <div className="fw-bold">Destination : </div>
                  <div className="ms-2">{loadDetails?.destination?.str}</div>
                </div>
                {loadDetails?.allInRate && ( // Conditional check for All-In Rate
                  <div className="d-flex">
                    <div className="fw-bold">All-In Rate : </div>
                    <div className="ms-2">{loadDetails?.allInRate} $</div>
                  </div>
                )}
              </div>
              <div className="col-4 mt-2">
                <div className="d-flex">
                  <div className="fw-bold">Equipment : </div>
                  <div className="ms-2">
                    {getEnumValue(Equipment, loadDetails.equipment)}
                  </div>
                </div>
                <div className="d-flex">
                  <div className="fw-bold">Mode : </div>
                  <div className="ms-2">
                    {getEnumValue(Mode, loadDetails.mode)}
                  </div>
                </div>
                <div className="d-flex">
                  <div className="fw-bold">Pick-up Date : </div>
                  <div className="ms-2">
                    {formatDate(
                      loadDetails.originEarlyPickupDate as Date,
                      "MM/dd/yyyy"
                    )}
                  </div>
                </div>
                {loadDetails?.length && (
                  <div className="d-flex">
                    <div className="fw-bold">Length : </div>
                    <div className="ms-2">{loadDetails?.length} ft</div>
                  </div>
                )}

                {loadDetails?.weight && (
                  <div className="d-flex">
                    <div className="fw-bold">Weight : </div>
                    <div className="ms-2">{loadDetails?.weight} Ibs</div>
                  </div>
                )}
              </div>
              <div className="col-4 mt-2">
                <div className="d-flex">
                  <div className="fw-bold">Load No : </div>
                  <div className="ms-2">{loadDetails?.loadNumber}</div>
                </div>
                <div className="d-flex">
                  <div className="fw-bold">Age : </div>
                  <div className="ms-2">{loadDetails?.formattedAge}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoadDetails;
