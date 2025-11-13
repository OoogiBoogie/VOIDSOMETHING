"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { motion, AnimatePresence } from "framer-motion"
import { Scene3D } from "@/components/scene-3d"
import { Minimap } from "@/components/minimap"
import { LoadingScreen } from "@/components/loading-screen"
import { InteriorSpace } from "@/components/interior-space"
import { StartScreen } from "@/components/StartScreen"
import { CyberpunkCityMap } from "@/components/cyberpunk-city-map"
import { PropertyMarketplace } from "@/components/PropertyMarketplace"
import { GlobalLandInventory } from "@/components/land/global-inventory"
import { GlobalChat } from "@/components/GlobalChat"
import { ActionBar } from "@/components/action-bar"
import { FriendSystem } from "@/components/friend-system"
import { MapBoundaryWarning } from "@/components/map-boundary-warning"
import { OnlineFriendsPanel } from "@/components/online-friends-panel"
import { DirectMessage } from "@/components/direct-message"
import { UserProfileSetup } from "@/components/user-profile-setup"
import { UserProfileEdit } from "@/components/user-profile-edit"
import { CreatePleadSystem } from "@/components/create-plead-system"
import { CRTOverlay } from "@/components/ui/crt-overlay"
import { XboxBladeNav } from "@/components/ui/xbox-blade-nav"
import { MobileTouchControls } from "@/components/mobile-touch-controls"
import { PhoneInterface } from "@/components/phone-interface"
import { Y2KDashboard } from "@/components/y2k-dashboard"
import { PowerUpStore } from "@/components/powerup-store" // Fixed import path from power-up-store to powerup-store (single hyphen)
import { PSXPledgeSystem } from "@/components/psx-pledge-system"
import { SKUMarketplace } from "@/components/sku-marketplace"
import { VoiceChatSystem } from "@/components/voice-chat-system"
import { TippingSystem } from "@/components/tipping-system"
import { MusicJukebox } from "@/components/music-jukebox"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { ZoneInteraction } from "@/components/zone-interaction"
import { XpDrawer } from "@/components/xp-drawer"
import { ProximityChat } from "@/components/proximity-chat"
import { BuildingConstructor } from "@/components/building-constructor"
import { EnhancedInventorySystem } from "@/components/enhanced-inventory-system"
import { CasinoGame } from "@/components/casino-game"
import { SystemsHub } from "@/components/systems-hub"
import { SystemsHubButton } from "@/components/systems-hub-button"
import { VOIDHub } from "@/components/hub/VOIDHub"
import { HUDRoot } from "@/hud/HUDRoot"
import { XPHubModal } from "@/components/ui/unified-hud/shared/XPHubModal"
import type { PlayerXp, DailyTask } from "@/lib/xp/types"
import { useOrientation } from "@/hooks/use-orientation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useInputMode } from "@/lib/input-mode"

export default function VOIDMetaverse() {
  // Input mode system (LOGIN vs WORLD)
  const { mode: inputMode, setMode: setInputMode } = useInputMode()
  
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 5 }) // Spawn at HQ
  const [currentZone, setCurrentZone] = useState<any>(null)
  const [activeZoneAction, setActiveZoneAction] = useState<string | null>(null)
  const [interiorOpen, setInteriorOpen] = useState(false)
  const [powerUpStoreOpen, setPowerUpStoreOpen] = useState(false)
  const [voidBalance, setVoidBalance] = useState(10500)
  const [activePowerUps, setActivePowerUps] = useState<Array<{ id: string; expiresAt: number }>>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [psxBalance, setPsxBalance] = useState(50000) // Demo PSX balance
  const [pledgeSystemOpen, setPledgeSystemOpen] = useState(false)
  const [skuMarketplaceOpen, setSKUMarketplaceOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [marketplaceOpen, setMarketplaceOpen] = useState(false)
  const [landInventoryOpen, setLandInventoryOpen] = useState(false)
  const [friendSystemOpen, setFriendSystemOpen] = useState(false)
  const [activeDM, setActiveDM] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [createPleadOpen, setCreatePleadOpen] = useState(false)
  const [cameraAngle, setCameraAngle] = useState<"close" | "medium" | "far">("medium")
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 })
  const [mobileSprinting, setMobileSprinting] = useState(false)
  const [voidHubOpen, setVoidHubOpen] = useState(false)
  const [crtEnabled, setCrtEnabled] = useState(true)
  const [bladeNavOpen, setBladeNavOpen] = useState(false)
  const [xpHubOpen, setXpHubOpen] = useState(false) // XP Hub modal

  const [playerXp, setPlayerXp] = useState<PlayerXp>({
    totalXp: 2450,
    explorerXp: 1100,
    builderXp: 750,
    operatorXp: 600,
    level: 4,
  })

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: "visit-3-zones",
      label: "District Explorer",
      description: "Visit 3 different zones today",
      xpReward: 60,
      progress: 0,
      target: 3,
      completed: false,
      track: "explorer",
    },
    {
      id: "walk-500m",
      label: "Steps in the VOID",
      description: "Walk 500m in the city",
      xpReward: 40,
      progress: 0,
      target: 500,
      completed: false,
      track: "explorer",
    },
    {
      id: "void-swap",
      label: "Void Trader",
      description: "Complete 1 trade on VOID DEX",
      xpReward: 50,
      progress: 0,
      target: 1,
      completed: false,
      track: "operator",
    },
    {
      id: "sku-buy",
      label: "Support a Creator",
      description: "Buy or mint 1 SKU item",
      xpReward: 75,
      progress: 0,
      target: 1,
      completed: false,
      track: "builder",
    },
    {
      id: "proximity-chat",
      label: "Say GM",
      description: "Send 1 message in proximity chat",
      xpReward: 30,
      progress: 0,
      target: 1,
      completed: false,
      track: "explorer",
    },
  ])

  const visitedZonesToday = useRef(new Set<string>())
  const totalDistanceWalked = useRef(0)
  const lastPlayerPos = useRef(playerPosition)

  const orientation = useOrientation()
  const isMobile = useIsMobile()
  const isLandscape = orientation === "landscape"
  const showTouchControls = isMobile && gameStarted && !interiorOpen && !mapOpen && !marketplaceOpen

  const [voiceChatOpen, setVoiceChatOpen] = useState(false)
  const [tippingOpen, setTippingOpen] = useState(false)
  const [selectedTipTarget, setSelectedTipTarget] = useState<any>(null)
  const [jukeboxOpen, setJukeboxOpen] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [proximityChatOpen, setProximityChatOpen] = useState(false)
  const [globalChatExpanded, setGlobalChatExpanded] = useState(false)

  const [buildingConstructorOpen, setBuildingConstructorOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  const [casinoOpen, setCasinoOpen] = useState(false)
  const [casinoGameType, setCasinoGameType] = useState<string | null>(null)

  const [systemsHubOpen, setSystemsHubOpen] = useState(false)

  useEffect(() => {
    // Device detection happens silently in production
  }, [isMobile, orientation])

  useEffect(() => {
    // Movement tracking happens without logging in production
  }, [mobileMovement, showTouchControls])

  // Expose global reset function for console access
  useEffect(() => {
    (window as any).resetIntro = () => {
      sessionStorage.removeItem("void_boot_intro_seen")
      setGameStarted(false)
      console.log("🔄 Intro reset complete! Boot intro will appear on next refresh.")
    }
    console.log("💡 TIP: Type resetIntro() in console to restart intro sequence")
  }, [])

  useEffect(() => {
    const handleOpenProximityChat = () => setProximityChatOpen(true)
    const handleOpenGlobalChat = () => setGlobalChatExpanded(true)

    window.addEventListener("openProximityChat", handleOpenProximityChat)
    window.addEventListener("openGlobalChat", handleOpenGlobalChat)

    return () => {
      window.removeEventListener("openProximityChat", handleOpenProximityChat)
      window.removeEventListener("openGlobalChat", handleOpenGlobalChat)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      // Keyboard controls disabled on mobile
      return
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip all HUD shortcuts if not in WORLD mode
      if (inputMode !== 'WORLD') {
        return
      }
      
      // Check if user is typing in a text field
      const target = e.target as HTMLElement
      const isTextInput = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      
      if (isTextInput) {
        // Don't intercept typing in forms
        return
      }

      const isMovementKey = ["w", "a", "s", "d"].includes(e.key.toLowerCase())

      if (e.key === "p" || e.key === "P") {
        e.preventDefault()
        setPhoneOpen(!phoneOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "Tab") {
        e.preventDefault()
        setDashboardOpen(!dashboardOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "i" || e.key === "I") {
        e.preventDefault()
        setInventoryOpen(!inventoryOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        setMapOpen(!mapOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault()
        setMarketplaceOpen(!marketplaceOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "l" || e.key === "L") {
        e.preventDefault()
        setLandInventoryOpen(!landInventoryOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault()
        setCrtEnabled(!crtEnabled)
      }

      if (e.key === "Escape") {
        // If blade nav is open, close it first
        if (bladeNavOpen) {
          setBladeNavOpen(false)
          return
        }
        // Otherwise toggle it
        setBladeNavOpen(true)
        return
      }

      if (e.key === "Escape" && !bladeNavOpen) {
        setPhoneOpen(false)
        setDashboardOpen(false)
        setInventoryOpen(false)
        setActiveGame(null)
        setActiveZoneAction(null)
        setChatOpen(false)
        setMapOpen(false)
        setMarketplaceOpen(false)
        setLandInventoryOpen(false)
        setFriendSystemOpen(false)
        setCreatePleadOpen(false)
      }

      if (currentZone && !isMovementKey && !interiorOpen) {
        if (e.key === "e" || e.key === "E") {
          e.preventDefault()
          setInteriorOpen(true)
          setFriendSystemOpen(false)
        }
      }

      if (e.key === "b" || e.key === "B") {
        e.preventDefault()
        setPowerUpStoreOpen(!powerUpStoreOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "x" || e.key === "X") {
        e.preventDefault()
        setPledgeSystemOpen(!pledgeSystemOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        setSKUMarketplaceOpen(!skuMarketplaceOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        setFriendSystemOpen(!friendSystemOpen)
        if (!friendSystemOpen) {
          setPhoneOpen(false)
          setDashboardOpen(false)
          setInventoryOpen(false)
          setMapOpen(false)
          setMarketplaceOpen(false)
        }
      }

      if (e.key === "o" || e.key === "O") {
        e.preventDefault()
        if (userProfile) {
          setProfileEditOpen(!profileEditOpen)
          setFriendSystemOpen(false)
        }
      }

      if (e.key === "g" || e.key === "G") {
        e.preventDefault()
        setCasinoOpen(!casinoOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "v" || e.key === "V") {
        e.preventDefault()
        setVoiceChatOpen(!voiceChatOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "j" || e.key === "J") {
        e.preventDefault()
        setJukeboxOpen(!jukeboxOpen)
        setFriendSystemOpen(false)
      }

      // Changed from S to Y to avoid conflict with WASD movement
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault()
        setSystemsHubOpen(!systemsHubOpen)
        setFriendSystemOpen(false)
      }

      if (e.key === "h" || e.key === "H") {
        e.preventDefault()
        setVoidHubOpen(!voidHubOpen)
        setFriendSystemOpen(false)
      }

      // RESET INTRO: Shift+R to clear intro and see it again
      if ((e.key === "r" || e.key === "R") && e.shiftKey) {
        e.preventDefault()
        sessionStorage.removeItem("void_boot_intro_seen")
        setGameStarted(false)
        console.log("🔄 Intro reset! Boot intro will appear on next refresh.")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [
    inputMode, // Added for input mode check
    phoneOpen,
    dashboardOpen,
    inventoryOpen,
    currentZone,
    interiorOpen,
    powerUpStoreOpen,
    chatOpen,
    pledgeSystemOpen,
    skuMarketplaceOpen,
    mapOpen,
    marketplaceOpen,
    landInventoryOpen,
    friendSystemOpen,
    profileEditOpen,
    userProfile,
    createPleadOpen,
    voiceChatOpen,
    jukeboxOpen,
    showPerformance,
    casinoOpen,
    systemsHubOpen,
    voidHubOpen,
    crtEnabled,
    bladeNavOpen,
  ])

  useEffect(() => {
    const dx = playerPosition.x - lastPlayerPos.current.x
    const dz = playerPosition.z - lastPlayerPos.current.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    totalDistanceWalked.current += distance
    lastPlayerPos.current = playerPosition

    setDailyTasks((tasks) =>
      tasks.map((task) =>
        task.id === "walk-500m"
          ? {
              ...task,
              progress: Math.floor(totalDistanceWalked.current),
              completed: totalDistanceWalked.current >= task.target,
            }
          : task,
      ),
    )
  }, [playerPosition])

  useEffect(() => {
    if (currentZone && !visitedZonesToday.current.has(currentZone.id)) {
      visitedZonesToday.current.add(currentZone.id)

      setDailyTasks((tasks) =>
        tasks.map((task) =>
          task.id === "visit-3-zones"
            ? {
                ...task,
                progress: visitedZonesToday.current.size,
                completed: visitedZonesToday.current.size >= task.target,
              }
            : task,
        ),
      )
    }
  }, [currentZone])

  const handleZoneAction = (action: string) => {
    setInteriorOpen(true)
  }

  const handlePowerUpPurchase = (powerUp: any) => {
    if (voidBalance >= powerUp.cost) {
      setVoidBalance(voidBalance - powerUp.cost)
      const expiresAt = Date.now() + powerUp.duration * 1000
      setActivePowerUps([...activePowerUps, { id: powerUp.id, expiresAt }])

      setTimeout(() => {
        setActivePowerUps((prev) => prev.filter((p) => p.id !== powerUp.id))
      }, powerUp.duration * 1000)

      setPowerUpStoreOpen(false)
    }
  }

  const handlePSXPledge = (amount: number) => {
    if (amount <= psxBalance) {
      setPsxBalance(psxBalance - amount)
      setVoidBalance(voidBalance + amount * 100)
      setPledgeSystemOpen(false)
    }
  }

  const handleSKUPurchase = (sku: any) => {
    if (voidBalance >= sku.price) {
      setVoidBalance(voidBalance - sku.price)
      setSKUMarketplaceOpen(false)
    }
  }

  const handlePropertyClick = (building: any) => {
    // Property click handled silently in production
  }

  const handlePropertyPurchase = (property: any) => {
    if (voidBalance >= property.listingPrice) {
      setVoidBalance(voidBalance - property.listingPrice)
      setMarketplaceOpen(false)
    }
  }

  const handleOpenDM = (friend: any) => {
    setActiveDM(friend)
  }

  const handleTeleportToFriend = (friend: any) => {
    setPlayerPosition({ x: friend.position.x, y: playerPosition.y, z: friend.position.z })
  }

  const handleProfileComplete = (profile: any) => {
    setUserProfile(profile)
    setGameStarted(true)
    // Transition to WORLD input mode
    setInputMode('WORLD')
    console.log('🎮 Entering world - Input mode: WORLD')
  }

  const handleProfileSave = (profile: any) => {
    setUserProfile(profile)
    setProfileEditOpen(false)
  }

  const handleEarnVoid = (amount: number) => {
    setVoidBalance(voidBalance + amount)
  }

  const handleBuildingCreate = (building: any) => {
    // Building created successfully
    setVoidBalance(voidBalance - building.cost)
  }

  const controlsEnabled = useMemo(
    () =>
      gameStarted &&
      !interiorOpen &&
      !mapOpen &&
      !marketplaceOpen &&
      !friendSystemOpen &&
      !createPleadOpen &&
      !phoneOpen &&
      !dashboardOpen &&
      !inventoryOpen &&
      !chatOpen &&
      !powerUpStoreOpen &&
      !pledgeSystemOpen &&
      !skuMarketplaceOpen &&
      !voiceChatOpen &&
      !jukeboxOpen &&
      !buildingConstructorOpen,
    [
      gameStarted,
      interiorOpen,
      mapOpen,
      marketplaceOpen,
      friendSystemOpen,
      createPleadOpen,
      phoneOpen,
      dashboardOpen,
      inventoryOpen,
      chatOpen,
      powerUpStoreOpen,
      pledgeSystemOpen,
      skuMarketplaceOpen,
      voiceChatOpen,
      jukeboxOpen,
      buildingConstructorOpen,
    ],
  )

  const showMainOverlays = useMemo(
    () => !interiorOpen && !mapOpen && !marketplaceOpen && !friendSystemOpen,
    [interiorOpen, mapOpen, marketplaceOpen, friendSystemOpen],
  )

  const handleOpenTip = (player: any) => {
    setSelectedTipTarget(player)
    setTippingOpen(true)
  }

  const handleTip = (amount: number) => {
    setVoidBalance(voidBalance - amount)
    // Tip sent successfully
  }

  const handleJukeboxVote = (trackId: string, cost: number) => {
    setVoidBalance(voidBalance - cost)
    // Vote cast successfully
  }

  const handleHubNavigate = (route: string) => {
    // Handle navigation based on route
    if (route === "/land/map") {
      setMapOpen(true)
    } else if (route === "/land/marketplace") {
      setMarketplaceOpen(true)
    } else if (route === "/apps/sku-market") {
      setSKUMarketplaceOpen(true)
    } else if (route === "/apps/casino") {
      setCasinoOpen(true)
    }
    // Add more route handlers as needed
  }

  return (
    <div
      className="bg-black overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* CRT overlay only active when in 3D world (after wallet connect) */}
      {/* Subtle CRT effect for atmosphere */}
      {gameStarted && <CRTOverlay enabled={crtEnabled} />}

      {!userProfile && <UserProfileSetup onComplete={handleProfileComplete} />}

      <AnimatePresence>
        {!gameStarted && userProfile && (
          <StartScreen 
            onStart={() => {
              setGameStarted(true)
              setInputMode('WORLD')
              console.log('🎮 Game started - Input mode: WORLD')
            }} 
          />
        )}
      </AnimatePresence>

      {gameStarted && userProfile && (
        <>
          <InteriorSpace zone={currentZone} isOpen={interiorOpen} onExit={() => setInteriorOpen(false)} />

          {showTouchControls && (
            <MobileTouchControls
              onMove={(direction) => setMobileMovement(direction)}
              onSprint={(sprinting) => setMobileSprinting(sprinting)}
              visible={true}
            />
          )}

          {buildingConstructorOpen && selectedProperty && (
            <BuildingConstructor
              isOpen={buildingConstructorOpen}
              onClose={() => {
                setBuildingConstructorOpen(false)
                setSelectedProperty(null)
              }}
              propertyId={selectedProperty}
              onBuildingCreate={handleBuildingCreate}
              voidBalance={voidBalance}
            />
          )}

          {casinoOpen && (
            <CasinoGame
              type={casinoGameType || "slots"}
              onClose={() => {
                setCasinoOpen(false)
                setCasinoGameType(null)
              }}
            />
          )}

          <SystemsHub isOpen={systemsHubOpen} onClose={() => setSystemsHubOpen(false)} />
          {/* <SystemsHubButton onClick={() => setSystemsHubOpen(!systemsHubOpen)} isMobile={isMobile} /> */}

          <PhoneInterface isOpen={phoneOpen} onClose={() => setPhoneOpen(false)} onOpenGame={setActiveGame} />
          <Y2KDashboard isOpen={dashboardOpen} onClose={() => setDashboardOpen(false)} />
          <EnhancedInventorySystem isOpen={inventoryOpen} onClose={() => setInventoryOpen(false)} />
          <PowerUpStore
            isOpen={powerUpStoreOpen}
            onClose={() => setPowerUpStoreOpen(false)}
            balance={voidBalance}
            onPurchase={handlePowerUpPurchase}
          />
          <PSXPledgeSystem
            isOpen={pledgeSystemOpen}
            onClose={() => setPledgeSystemOpen(false)}
            psxBalance={psxBalance}
            voidBalance={voidBalance}
            onPledge={handlePSXPledge}
          />
          <SKUMarketplace
            isOpen={skuMarketplaceOpen}
            onClose={() => setSKUMarketplaceOpen(false)}
            voidBalance={voidBalance}
            onPurchase={handleSKUPurchase}
          />

          <VoiceChatSystem
            currentPosition={{ x: playerPosition.x, z: playerPosition.z }}
            isOpen={voiceChatOpen}
            onClose={() => setVoiceChatOpen(false)}
          />

          {selectedTipTarget && (
            <TippingSystem
              targetPlayer={selectedTipTarget}
              userBalance={voidBalance}
              isOpen={tippingOpen}
              onClose={() => {
                setTippingOpen(false)
                setSelectedTipTarget(null)
              }}
              onTip={handleTip}
            />
          )}

          <MusicJukebox
            isOpen={jukeboxOpen}
            onClose={() => setJukeboxOpen(false)}
            voidBalance={voidBalance}
            onVote={handleJukeboxVote}
          />
        </>
      )}

      {gameStarted && userProfile && (
        <VOIDHub
          isOpen={voidHubOpen}
          onClose={() => setVoidHubOpen(false)}
          userProfile={userProfile}
          voidBalance={voidBalance}
          psxBalance={psxBalance}
          onNavigate={handleHubNavigate}
        />
      )}

      <AnimatePresence>
        {showPerformance && (
          <motion.div
            key="performance-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PerformanceDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* OLD HUD ELEMENTS - DISABLED FOR NEW HUD */}
      {/* {gameStarted && userProfile && <XpDrawer xp={playerXp} tasks={dailyTasks} />} */}

      {/* NEW ENGAGEMENT HUD SYSTEM */}
      {gameStarted && userProfile && (
        <HUDRoot>
          {/* 3D World Canvas */}
          <div className={interiorOpen ? "hidden" : "block"} style={{ width: "100%", height: "100%" }}>
            <Canvas
              shadows
              gl={{
                antialias: !isMobile,
                alpha: false,
                powerPreference: "high-performance",
              }}
              dpr={isMobile ? 1 : [1, 2]}
              camera={{ position: [0, 50, 50], fov: 65, near: 0.1, far: 1000 }}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <Scene3D
                playerPosition={playerPosition}
                onPlayerMove={setPlayerPosition}
                onZoneEnter={setCurrentZone}
                onZoneExit={() => setCurrentZone(null)}
                controlsEnabled={controlsEnabled}
                onCameraAngleChange={setCameraAngle}
                mobileMovement={mobileMovement}
                mobileSprinting={mobileSprinting}
                isMobile={isMobile}
              />
            </Canvas>
          </div>
        </HUDRoot>
      )}

      {/* XP Hub Modal */}
      <XPHubModal isOpen={xpHubOpen} onClose={() => setXpHubOpen(false)} />

      {/* Xbox Blade Navigation - ESC to toggle */}
      <XboxBladeNav 
        activeSection={bladeNavOpen ? 'inventory' : null}
        onClose={() => setBladeNavOpen(false)}
      >
        <div className="p-6 space-y-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#9ccc00] uppercase tracking-wider mb-2">VOID SYSTEMS</h2>
            <p className="text-gray-400 text-sm font-mono">Press ESC to close</p>
          </div>
          
          <button
            onClick={() => { setMapOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">N</span> - City Map
          </button>
          
          <button
            onClick={() => { setLandInventoryOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">L</span> - Land Registry
          </button>
          
          <button
            onClick={() => { setMarketplaceOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">R</span> - Property Marketplace
          </button>
          
          <button
            onClick={() => { setSKUMarketplaceOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">M</span> - SKU Marketplace
          </button>
          
          <button
            onClick={() => { setPowerUpStoreOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">B</span> - Power-Up Store
          </button>
          
          <button
            onClick={() => { setFriendSystemOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">F</span> - Friends
          </button>
          
          <button
            onClick={() => { setVoiceChatOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">V</span> - Voice Chat
          </button>
          
          <button
            onClick={() => { setSystemsHubOpen(true); setBladeNavOpen(false); }}
            className="w-full text-left px-4 py-3 bg-black/50 border-2 border-[#9ccc00]/30 hover:border-[#9ccc00] rounded text-white font-mono transition-colors"
          >
            <span className="text-[#9ccc00]">S</span> - Systems Hub
          </button>
            
          <div className="mt-8 pt-4 border-t border-[#9ccc00]/20">
            <button
              onClick={() => { setCrtEnabled(!crtEnabled); }}
              className="w-full text-left px-4 py-3 bg-black/50 border-2 border-cyan-500/30 hover:border-cyan-500 rounded text-white font-mono transition-colors"
            >
              <span className="text-cyan-400">C</span> - CRT Effect: {crtEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => { 
                sessionStorage.removeItem("void_boot_intro_seen");
                setGameStarted(false);
                setBladeNavOpen(false);
              }}
              className="w-full text-left px-4 py-3 mt-2 bg-black/50 border-2 border-red-500/30 hover:border-red-500 rounded text-white font-mono transition-colors"
            >
              <span className="text-red-400">SHIFT+R</span> - Reset Intro
            </button>
          </div>
        </div>
      </XboxBladeNav>
    </div>
  )
}
