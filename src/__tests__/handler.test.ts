import { executeOperation } from "../handler";
import * as TE from "fp-ts/lib/TaskEither";
import { some } from "fp-ts/lib/Option";
import {
  NewService,
  RetrievedService,
  Service,
  ServiceModel,
  toAuthorizedCIDRs,
  toAuthorizedRecipients,
} from "@pagopa/io-functions-commons/dist/src/models/service";
import {
  NonEmptyString,
  OrganizationFiscalCode,
} from "@pagopa/ts-commons/lib/strings";
import { MaxAllowedPaymentAmount } from "@pagopa/io-functions-commons/dist/generated/definitions/MaxAllowedPaymentAmount";

const anOrganizationFiscalCode = "01234567890" as OrganizationFiscalCode;

const aService: Service = {
  authorizedCIDRs: toAuthorizedCIDRs([]),
  authorizedRecipients: toAuthorizedRecipients([]),
  departmentName: "MyDeptName" as NonEmptyString,
  isVisible: true,
  maxAllowedPaymentAmount: 0 as MaxAllowedPaymentAmount,
  organizationFiscalCode: anOrganizationFiscalCode,
  organizationName: "MyOrgName" as NonEmptyString,
  requireSecureChannels: false,
  serviceId: "MySubscriptionId" as NonEmptyString,
  serviceName: "MyServiceName" as NonEmptyString,
};

const aNewService: NewService = {
  ...aService,
  kind: "INewService",
};
import { aCosmosResourceMetadata } from "../../__mocks__/mocks";
import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { Container, PatchRequestBody } from "@azure/cosmos";
import { isRight } from "fp-ts/lib/Either";

const aRetrievedService: RetrievedService = {
  ...aNewService,
  ...aCosmosResourceMetadata,
  id: "123" as NonEmptyString,
  kind: "IRetrievedService",
  version: 1 as NonNegativeInteger,
};

describe("Patch operation", () => {
  it("should update a service", async () => {
    const serviceModelMock = {
      findLastVersionByModelId: jest.fn(() => {
        return TE.of(some(aRetrievedService));
      }),
    } as any as ServiceModel;

    const containerMock = {
      item: jest.fn(() => {
        return {
          patch: jest.fn(() => Promise.resolve(void 0)),
        };
      }),
    } as any as Container;
    const operation: PatchRequestBody = [
      { op: "set", path: "/isVisible", value: true },
    ];
    const res = await executeOperation(
      containerMock,
      serviceModelMock,
      ["123" as NonEmptyString],
      operation
    )();
    expect(isRight(res)).toBe(true);
  });
});
