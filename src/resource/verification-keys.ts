export const VERIFICATION_KEYS = {
  staging: {
    // staging must never contain secret keys
    publicKey: 'bDgK1223JbrDNePFIrj7b0z02Z5nSiBzkRYRqDdVPfA=',
  },
  development: {
    // Using the same keys for staging.
    publicKey: 'bDgK1223JbrDNePFIrj7b0z02Z5nSiBzkRYRqDdVPfA=',
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
