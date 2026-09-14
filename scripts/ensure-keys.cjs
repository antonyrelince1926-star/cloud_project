// scripts/ensure-keys.cjs
// Startup script to automatically generate RSA-2048 key pairs if missing from environment or .env

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

function generateRsa2048KeyPair() {
  console.log('[Security Startup] Generating fresh RSA-2048 key pair (modulus: 2048 bits, PKCS#8/SPKI)...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return {
    privateKeyPem: privateKey.trim(),
    publicKeyPem: publicKey.trim(),
    privateKeyEscaped: privateKey.trim().replace(/\r?\n/g, '\\n'),
    publicKeyEscaped: publicKey.trim().replace(/\r?\n/g, '\\n')
  };
}

function ensureKeys() {
  const force = process.argv.includes('--force');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }

  const hasPrivateKey = !force && (process.env.ROOT_SIGNING_PRIVATE_KEY || (envContent.includes('ROOT_SIGNING_PRIVATE_KEY=') && !envContent.includes('ROOT_SIGNING_PRIVATE_KEY=""')));
  const hasPublicKey = !force && (process.env.ROOT_SIGNING_PUBLIC_KEY || (envContent.includes('ROOT_SIGNING_PUBLIC_KEY=') && !envContent.includes('ROOT_SIGNING_PUBLIC_KEY=""')));

  if (hasPrivateKey && hasPublicKey && !force) {
    console.log('[Security Startup] ✓ RSA-2048 ROOT_SIGNING keys already configured.');
    return;
  }

  const keys = generateRsa2048KeyPair();

  // Update or create .env
  let newEnv = envContent;
  if (!newEnv.includes('ROOT_SIGNING_PRIVATE_KEY=')) {
    newEnv += `\nROOT_SIGNING_PRIVATE_KEY="${keys.privateKeyEscaped}"\n`;
  } else {
    newEnv = newEnv.replace(
      /ROOT_SIGNING_PRIVATE_KEY=.*/,
      `ROOT_SIGNING_PRIVATE_KEY="${keys.privateKeyEscaped}"`
    );
  }

  if (!newEnv.includes('ROOT_SIGNING_PUBLIC_KEY=')) {
    newEnv += `ROOT_SIGNING_PUBLIC_KEY="${keys.publicKeyEscaped}"\n`;
  } else {
    newEnv = newEnv.replace(
      /ROOT_SIGNING_PUBLIC_KEY=.*/,
      `ROOT_SIGNING_PUBLIC_KEY="${keys.publicKeyEscaped}"`
    );
  }

  fs.writeFileSync(envPath, newEnv.trim() + '\n', 'utf8');
  console.log(`[Security Startup] ✓ Configured ROOT_SIGNING keys in ${envPath}`);

  // Also keep .env.example populated with valid development keys (no placeholders)
  if (fs.existsSync(envExamplePath)) {
    let exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    exampleContent = exampleContent.replace(
      /ROOT_SIGNING_PRIVATE_KEY=.*/,
      `ROOT_SIGNING_PRIVATE_KEY="${keys.privateKeyEscaped}"`
    );
    exampleContent = exampleContent.replace(
      /ROOT_SIGNING_PUBLIC_KEY=.*/,
      `ROOT_SIGNING_PUBLIC_KEY="${keys.publicKeyEscaped}"`
    );
    fs.writeFileSync(envExamplePath, exampleContent, 'utf8');
    console.log(`[Security Startup] ✓ Synchronized valid development keys in ${envExamplePath}`);
  }

  console.log('[Security Startup] RSA-2048 Key Pair generation and configuration complete.');
}

ensureKeys();
