export const SIGNING_KEYS = {
  staging: {
    // staging must never contain secret keys
    publicKey: 'rjv41kYqZwcbe3r6ymMEEKQ+Vd+DPuogN+Gzq3lP2Og=',
  },
  development: {
    publicKey: '5AYDhjpaloNn4kg7PY0LVpsYAEG/7oI8n1XZjR42vz0=',
    secretKey: '0oUKRb8q2l8/n32WeXWQ0yiBhEQXTD7i3UPGj2Y0a0g=',
  },
  production: {
    // production must never contain secret keys
    publicKey: '3Tt8VduXsjjd4IrpdCd7BAkdZl/vUCstu9UvTX84FWw=',
  },
  test: {
    publicKey: 'KUY1XT30ar+XreVjsS1w/c3EpDs2oASbF6G3evvaUJM=',
    secretKey:
      '/u+LP57Ib9y5Ytpud56FzuitSC9O6lJ4EOLOFHpsHlYpRjVdPfRqv5et5WOxLXD9zcSkOzagBJsXobd6+9pQkw==',
  },
}
