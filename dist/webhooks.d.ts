/**
 * Constructs the `X-FormSG-Signature` header
 * @param params The parameters needed to construct the header
 * @param params.epoch Epoch timestamp
 * @param params.submissionId Mongo ObjectId
 * @param params.formId Mongo ObjectId
 * @param params.signature A signature generated by the generateSignature() function
 * @returns The `X-FormSG-Signature` header
 */
declare function constructHeader({ epoch, submissionId, formId, signature, }: {
    epoch: number;
    submissionId: string;
    formId: string;
    signature: string;
}): string;
declare const _default: (params?: PackageInitParams) => {
    authenticate: (header: string, uri: string) => void;
    generateSignature: (({ uri, submissionId, formId, epoch, }: {
        uri: string;
        submissionId: Object;
        formId: string;
        epoch: number;
    }) => string) | (() => void);
    constructHeader: typeof constructHeader | (() => void);
};
/**
 * Provider that accepts configuration
 * before returning the webhooks module
 */
export = _default;
