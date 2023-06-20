import { ServiceModel } from "@pagopa/io-functions-commons/dist/src/models/service";
import { PatchRequestBody } from "@azure/cosmos";

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { cosmosdbClient } from "./utils/cosmosdb";
import { getConfigOrThrow } from "./utils/config";

import { executeOperation } from "./handler";

const config = getConfigOrThrow();

const sm = new ServiceModel(
  cosmosdbClient
    .database(config.COSMOSDB_NAME)
    .container(config.COSMOSDB_COLLECTION)
);

const operation: PatchRequestBody = [
  { op: "set", path: "/isVisible", value: true },
];

executeOperation(
  cosmosdbClient
    .database(config.COSMOSDB_NAME)
    .container(config.COSMOSDB_COLLECTION),
  sm
)(
  [
    "01EYNQ0864HKYR1Q9PXPJ18W7G" as NonEmptyString,
    "01EYNQ08CFNATVH1YBN8D14Y8S" as NonEmptyString,
    "01F3ADXET5NZD4GD9320XXQ66Y" as NonEmptyString,
    "01EHA20ZNHWBR2MHG706S46RWQ" as NonEmptyString,
  ],
  operation
)()
  // eslint-disable-next-line no-console
  .then(() => console.log("Job done"))
  // eslint-disable-next-line no-console
  .catch(console.log);
