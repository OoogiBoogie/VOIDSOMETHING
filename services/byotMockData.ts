/**
 * BYOT Mock Data
 * Phase 1 mock inventory tokens, world uses, and BYOT projects
 */

import {
  InventoryToken,
  WorldUse,
  BYOTProjectConfig,
} from './byotTypes';

export const MOCK_INVENTORY_TOKENS: InventoryToken[] = [
  // Native Tokens
  {
    id: 'erc20:VOID',
    standard: 'erc20',
    chainId: 8453,
    contractAddress: '0xVOID0000000000000000000000000000000000',
    symbol: 'VOID',
    name: 'VOID',
    amount: '1234.56',
    iconUrl: '',
    isBYOT: false,
  },
  {
    id: 'erc20:PSX',
    standard: 'erc20',
    chainId: 8453,
    contractAddress: '0xPSX00000000000000000000000000000000000',
    symbol: 'PSX',
    name: 'PSX',
    amount: '200.00',
    iconUrl: '',
    isBYOT: false,
  },
  {
    id: 'erc20:FRAME',
    standard: 'erc20',
    chainId: 8453,
    contractAddress: '0xFRAME000000000000000000000000000000000',
    symbol: 'FRAME',
    name: 'Frame',
    amount: '890.00',
    iconUrl: '',
    isBYOT: false,
  },
  
  // Creator Token
  {
    id: 'erc20:CREATOR-HANA',
    standard: 'erc20',
    chainId: 8453,
    contractAddress: '0xHANA0000000000000000000000000000000000',
    symbol: 'HANA',
    name: 'Hana Token',
    amount: '42.0',
    iconUrl: '',
    isBYOT: false,
    linkedCreatorId: 'creator-hana',
  },
  
  // BYOT Token
  {
    id: 'erc20:BYOT-XYZ',
    standard: 'erc20',
    chainId: 1,
    contractAddress: '0xBYOT0000000000000000000000000000000000',
    symbol: 'XYZ',
    name: 'XYZ Token',
    amount: '999.99',
    iconUrl: '',
    isBYOT: true,
  },
  
  // ERC1155 Item
  {
    id: 'erc1155:0xGAMEITEM:1',
    standard: 'erc1155',
    chainId: 8453,
    contractAddress: '0xGAMEITEM00000000000000000000000000000',
    tokenId: '1',
    name: 'Neon Sword',
    amount: '1',
    iconUrl: '',
    isBYOT: false,
  },
];

export const MOCK_WORLD_USES: WorldUse[] = [
  {
    id: 'use-1',
    tokenId: 'erc20:CREATOR-HANA',
    type: 'access_area',
    label: 'HANA Gallery VIP Access',
    description: 'Enter HANA\'s rooftop gallery in Neon District.',
    areaId: 'parcel:D1-01x00',
  },
  {
    id: 'use-2',
    tokenId: 'erc20:FRAME',
    type: 'xp_boost',
    label: '+20% XP Boost',
    description: 'Holding 100+ FRAME gives 1.2x XP gain.',
    boostMultiplier: 1.2,
  },
  {
    id: 'use-3',
    tokenId: 'erc20:BYOT-XYZ',
    type: 'special_role',
    label: 'XYZ Partner Role',
    description: 'Grants partner role and access to XYZ lounge.',
    roleKey: 'partner-xyz',
    areaId: 'parcel:D1-10x10',
  },
  {
    id: 'use-4',
    tokenId: 'erc1155:0xGAMEITEM:1',
    type: 'cosmetic_skin',
    label: 'Neon Sword Cosmetic',
    description: 'Equip a glowing neon sword in-world.',
    cosmeticId: 'cosmetic-neon-sword',
  },
  {
    id: 'use-5',
    tokenId: 'erc20:VOID',
    type: 'discount',
    label: 'Land Purchase Discount',
    description: 'Holding 1000+ VOID gives 10% off incubator land purchases.',
    discountPercent: 10,
    appliesTo: 'land',
  },
];

export const MOCK_BYOT_PROJECTS: BYOTProjectConfig[] = [
  {
    id: 'byot-xyz',
    name: 'XYZ Network',
    description: 'Partner project from Ethereum mainnet, integrated via BYOT registry.',
    iconUrl: '',
    tokenContracts: [
      {
        contractAddress: '0xBYOT0000000000000000000000000000000000',
        chainId: 1,
        standard: 'erc20',
        defaultSymbol: 'XYZ',
      },
    ],
    worldUseIds: ['use-3'],
  },
];
