/**
 * Net Protocol Type Definitions
 * Global types for Net Protocol SDK
 */

interface NetProtocolStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
}

interface NetProtocolSDK {
  storage: NetProtocolStorage;
  // Add other Net Protocol methods as needed
  profile?: {
    get(address: string): Promise<any>;
  };
}

declare global {
  interface Window {
    np?: NetProtocolSDK;
  }
  
  // For server-side access
  const np: NetProtocolSDK | undefined;
}

export {};
