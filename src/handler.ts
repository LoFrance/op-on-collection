/* eslint-disable no-console */
import { Container, PatchRequestBody } from "@azure/cosmos";
import { ServiceModel } from "@pagopa/io-functions-commons/dist/src/models/service";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  IResponseErrorQuery,
  ResponseErrorQuery,
} from "@pagopa/io-functions-commons/dist/src/utils/response";
import {
  IResponseErrorNotFound,
  ResponseErrorNotFound,
} from "@pagopa/ts-commons/lib/responses";
import * as RA from "fp-ts/lib/ReadonlyArray";

export const executeOperation =
  (container: Container, serviceModel: ServiceModel) =>
  (
    servicesId: ReadonlyArray<NonEmptyString>,
    patchOperations: PatchRequestBody
  ): TE.TaskEither<
    NonEmptyString | IResponseErrorQuery | IResponseErrorNotFound,
    ReadonlyArray<void>
  > =>
    pipe(
      servicesId,
      RA.map((serviceId) =>
        pipe(
          serviceModel.findLastVersionByModelId([serviceId]),
          TE.mapLeft((failure) =>
            ResponseErrorQuery("Error while retrieving the service", failure)
          ),
          TE.chainW(
            TE.fromOption(() =>
              ResponseErrorNotFound(
                "Service not found",
                "The service you requested was not found in the system."
              )
            )
          ),
          TE.chainW((lastVersion) =>
            TE.tryCatch(
              () =>
                container
                  .item(lastVersion.id, serviceId)
                  .patch(patchOperations),
              (error) => error as NonEmptyString
            )
          ),
          // eslint-disable-next-line no-console
          TE.map(() => console.log("aggiornato", serviceId))
        )
      ),
      RA.sequence(TE.ApplicativePar)
    );
