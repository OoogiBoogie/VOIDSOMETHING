module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          { name: "wagmi", message: "Use wagmi only in client components." },
          { name: "@privy-io/react-auth", message: "Use Privy only in client components." },
        ],
        patterns: [
          {
            group: ["wagmi/*", "@privy-io/*"],
            message: "Use these only under 'use client' files.",
          },
          {
            group: ["hardhat*", "**/scripts/**", "**/contracts/**"],
            message: "Server/Dev only. Do not import in client.",
          },
          {
            group: ["@nomicfoundation/**", "ethers/hardhat", "ganache*"],
            message: "Hardhat-only. Do not import in client.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["app/**/layout.tsx", "app/**/page.tsx", "app/**/route.ts", "app/**/loading.tsx", "components/**/*.tsx", "hud/**/*.tsx"],
      rules: {
        "no-restricted-imports": "error",
      },
    },
  ],
};
