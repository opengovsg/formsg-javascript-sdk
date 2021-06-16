export const VERIFICATION_KEYS = {
  staging: {
    // staging must never contain secret keys
    publicKey: 'bDgK1223JbrDNePFIrj7b0z02Z5nSiBzkRYRqDdVPfA=',
  },
  development: {
    publicKey: 'yMfJ8unVMWfHPoDRY23SdFnWudMXmB6pGfDgBVhRbzs=',
    secretKey: 'p4iJR5B/YobjRYcIO8iiJmmsMH7YjIr4O1P4DY1lyO0=',
  },
  production: {
    // production must never contain secret keys
    publicKey: 'W/lf24kRJ9PVvSK1Ubjjhc9zHjp1amKr+3Q+Nmsy4w4=',
  },
  test: {
    publicKey: 'ileDo328P/UApBPANuS/xO6P4BuHSgPnjRRBifgQYvs=',
    secretKey:
      'zLnXIV0cGjODell5w1usEHcGOJ/xsQDuDOw2BPcPEQOKV4Ojfbw/9QCkE8A25L/E7o/gG4dKA+eNFEGJ+BBi+w==',
  },
}
