"use client";

import React from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Landmark, Vote, FileText, Users } from 'lucide-react';
import { GovernancePortal } from '@/components/governance-portal';

/**
 * DAO / GOVERNANCE SCREEN
 * Voting, proposals, DAO management
 */

export function DAOScreen() {
  return (
    <div className="p-6">
      <GovernancePortal />
    </div>
  );
}
