# Void Protocol Contracts

On-chain messaging and storage for The Void metaverse using **Net Protocol** and **Net Storage**.

## 📦 Contracts

- **`VoidMessaging.sol`** - Global chat, zone chat, and direct messaging
- **`VoidStorage.sol`** - User profiles, settings, and global config
- **`INet.sol`** - Net Protocol interface
- **`IStorage.sol`** - Net Storage interface

## 🚀 Quick Start

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-void-protocol.ts --network sepolia
```

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <MESSAGING_ADDRESS> \
  0x00000000B24D62781dB359b07880a105cD0b64e6 \
  0x00000000DB40fcB9f4466330982372e27Fd7Bbf5

npx hardhat verify --network sepolia <STORAGE_ADDRESS> \
  0x00000000DB40fcB9f4466330982372e27Fd7Bbf5
```

## 📚 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete frontend integration
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical overview

## ✨ Features

### Messaging
- ✅ Global chat (topic-based)
- ✅ Zone/district chat
- ✅ Direct messages (1-on-1)
- ✅ Real-time events
- ✅ Message history with pagination

### Storage
- ✅ User profiles (JSON)
- ✅ Messaging settings
- ✅ Global configuration
- ✅ Version history
- ✅ User data ownership

## 🔗 Net Protocol Addresses

### Ethereum Sepolia
- Net Protocol: `0x00000000B24D62781dB359b07880a105cD0b64e6`
- Net Storage: `0x00000000DB40fcB9f4466330982372e27Fd7Bbf5`

## 📝 License

MIT
