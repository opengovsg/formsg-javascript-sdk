declare const _default: (params?: PackageInitParams) => {
    authenticate: (header: string, uri: string) => void;
    generateSignature: Function;
    constructHeader: Function;
};
/**
 * Provider that accepts configuration
 * before returning the webhooks module
 */
export = _default;
