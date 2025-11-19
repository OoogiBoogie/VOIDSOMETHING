import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * useRealEstateToasts
 * 
 * Standardized toast notifications for real estate actions.
 * Shows user feedback for claim/list/cancel/purchase operations.
 */
export function useRealEstateToasts() {
  const notifyClaimed = useCallback((parcelId: string) => {
    toast.success(
      `Parcel #${parcelId} claimed`,
      {
        description: 'TESTNET SIMULATION · Off-chain state only',
        duration: 3000,
      }
    );
  }, []);

  const notifyListed = useCallback((parcelId: string, priceVoid: string) => {
    toast.success(
      `Parcel #${parcelId} listed for ${priceVoid} VOID`,
      {
        description: 'TESTNET SIMULATION · Off-chain state only',
        duration: 3000,
      }
    );
  }, []);

  const notifyCanceled = useCallback((parcelId: string) => {
    toast.info(
      `Listing canceled for Parcel #${parcelId}`,
      {
        description: 'TESTNET SIMULATION · Off-chain state only',
        duration: 3000,
      }
    );
  }, []);

  const notifySold = useCallback((parcelId: string, priceVoid: string, buyerAddress?: string) => {
    toast.success(
      `Parcel #${parcelId} sold for ${priceVoid} VOID`,
      {
        description: buyerAddress 
          ? `Ownership transferred to ${buyerAddress.slice(0, 6)}...${buyerAddress.slice(-4)} (TESTNET)`
          : 'TESTNET SIMULATION · Off-chain state only',
        duration: 4000,
      }
    );
  }, []);

  return {
    notifyClaimed,
    notifyListed,
    notifyCanceled,
    notifySold,
  };
}
